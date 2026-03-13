# 보류 작업 #2: Agent 실행 진행 상태 표시 (Progress Indication)

**작성일**: 2026-03-13
**우선순위**: High
**상태**: 보류 (백엔드 API 변경 필요)
**관련 모듈**: admin (frontend), api-agent (backend)

---

## 1. 배경 및 문제

### 현재 상황

Agent API(`POST /api/v1/agent/run`)는 **동기 HTTP 요청**으로 동작하며, LLM 처리와 외부 API 호출에 따라 **10~60초**가 소요됩니다. 현재 프론트엔드에서는 단순 로딩 스피너와 정적 텍스트("Agent is working... This may take up to a minute.")로 처리하고 있습니다.

### 문제점

| 문제 | 영향 |
|------|------|
| 사용자가 현재 진행 단계를 알 수 없음 | 10~60초 대기 중 불안감, 작업 중단 여부 판단 불가 |
| 응답 없이 긴 대기 시간 | 사용자가 페이지 이탈하거나 중복 요청 발생 가능 |
| Tool 호출 횟수/진행률 정보 부재 | 복잡한 작업의 경우 완료까지 얼마나 남았는지 예측 불가 |

### 프론트엔드 단독 구현이 불가능한 이유

현재 `POST /api/v1/agent/run` 엔드포인트는 **최종 결과만 단일 JSON으로 반환**합니다. HTTP 요청-응답 모델에서는 중간 상태를 전달할 방법이 없습니다. 프론트엔드에서 가능한 대안(폴링, 타이머 기반 가짜 진행률)은 실제 백엔드 상태와 무관하므로 **업계 표준 베스트 프랙티스에 부합하지 않습니다.**

---

## 2. 업계 표준 분석

### 주요 AI 서비스의 접근 방식

| 서비스 | 방식 | 특징 |
|--------|------|------|
| OpenAI (ChatGPT, Assistants API) | SSE (Server-Sent Events) | `text/event-stream`, 단계별 이벤트(`thread.run.step.created`, `thread.run.step.completed` 등) |
| Anthropic (Claude API) | SSE | `text/event-stream`, 이벤트 타입별 스트리밍(`message_start`, `content_block_delta`, `message_stop`) |
| Google (Gemini API) | SSE | `streamGenerateContent`, 청크 단위 스트리밍 |
| LangChain/LangGraph | Callback + SSE | `astream_events`, 단계별 이벤트 스트리밍 |

**결론**: SSE(Server-Sent Events)가 AI Agent 실행 진행 상태 표시의 **업계 표준**입니다.

### SSE vs WebSocket vs Polling 비교

| 기준 | SSE | WebSocket | Polling |
|------|-----|-----------|---------|
| 적합성 | 서버→클라이언트 단방향 스트리밍에 최적 | 양방향 통신에 적합, Agent에는 과도 | 실시간성 부족, 서버 부하 |
| 구현 복잡도 | 낮음 (HTTP 기반) | 중간 (프로토콜 업그레이드 필요) | 낮음 (비효율적) |
| 인프라 호환성 | Gateway/Proxy 친화적 | WebSocket 지원 필요 | 제한 없음 |
| 자동 재연결 | `EventSource` 내장 지원 | 직접 구현 필요 | 해당 없음 |
| **권장 여부** | **권장** | 비권장 | 비권장 |

---

## 3. 제안: 백엔드 API 변경 사항

### 3.1 새 엔드포인트 추가

**기존 엔드포인트 유지** (하위 호환성):
- `POST /api/v1/agent/run` — 기존 동기 API (변경 없음)

**신규 SSE 엔드포인트 추가**:
- `POST /api/v1/agent/run/stream` — SSE 스트리밍 API

```
POST /api/v1/agent/run/stream
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer {accessToken}

{
  "goal": "최신 AI 기술 동향을 수집하고 분석해줘",
  "sessionId": "admin-123-abc12345"
}
```

### 3.2 SSE 이벤트 설계

```
event: started
data: {"sessionId":"admin-123-abc12345","timestamp":"2026-03-13T10:00:00Z"}

event: step
data: {"phase":"PLANNING","message":"작업 계획을 수립하고 있습니다...","progress":10}

event: tool_call
data: {"toolName":"search_emerging_techs","status":"STARTED","toolCallIndex":1,"message":"Emerging Tech 검색 중..."}

event: tool_call
data: {"toolName":"search_emerging_techs","status":"COMPLETED","toolCallIndex":1,"message":"15건의 결과를 찾았습니다."}

event: tool_call
data: {"toolName":"get_emerging_tech_statistics","status":"STARTED","toolCallIndex":2,"message":"통계 분석 중..."}

event: step
data: {"phase":"ANALYZING","message":"수집된 데이터를 분석하고 있습니다...","progress":60}

event: step
data: {"phase":"SUMMARIZING","message":"결과를 요약하고 있습니다...","progress":90}

event: completed
data: {"success":true,"summary":"GitHub에서 10개, RSS에서 5개의 신기술 정보를 수집했습니다.","sessionId":"admin-123-abc12345","toolCallCount":15,"analyticsCallCount":3,"executionTimeMs":12500,"errors":[]}

```

### 3.3 이벤트 타입 정의

| 이벤트 | 데이터 필드 | 설명 |
|--------|------------|------|
| `started` | `sessionId`, `timestamp` | Agent 실행 시작 |
| `step` | `phase`, `message`, `progress` | 실행 단계 변경 (0-100%) |
| `tool_call` | `toolName`, `status`, `toolCallIndex`, `message` | Tool 호출 시작/완료 |
| `error` | `code`, `message` | 오류 발생 (스트림 종료하지 않음) |
| `completed` | `AgentExecutionResult` 전체 필드 | 실행 완료 (스트림 종료) |
| `failed` | `code`, `message` | 실행 실패 (스트림 종료) |

### 3.4 Phase Enum

| Phase | 설명 | 예상 진행률 범위 |
|-------|------|--------------|
| `PLANNING` | 작업 계획 수립 | 0-10% |
| `COLLECTING` | 데이터 수집 (Tool 호출) | 10-50% |
| `ANALYZING` | 데이터 분석 | 50-80% |
| `SUMMARIZING` | 결과 요약 생성 | 80-95% |
| `FINALIZING` | 최종 처리 및 저장 | 95-100% |

### 3.5 LangChain4j 구현 참고

현재 백엔드는 LangChain4j 기반입니다. LangChain4j의 `TokenStream`과 `StreamingChatLanguageModel`을 활용하여 SSE 구현이 가능합니다:

```java
// Spring WebFlux + LangChain4j 예시 (참고용)
@PostMapping(value = "/run/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> runAgentStream(@RequestBody AgentRunRequest request) {
    return agentService.executeStream(request)
        .map(event -> ServerSentEvent.<String>builder()
            .event(event.getType())
            .data(objectMapper.writeValueAsString(event.getData()))
            .build());
}
```

---

## 4. 제안: 프론트엔드 구현 계획

### 4.1 새로운 타입 정의

```typescript
// types/agent.ts에 추가

export type AgentPhase =
  | "PLANNING"
  | "COLLECTING"
  | "ANALYZING"
  | "SUMMARIZING"
  | "FINALIZING";

export interface AgentStreamEvent {
  type: "started" | "step" | "tool_call" | "error" | "completed" | "failed";
}

export interface AgentStartedEvent extends AgentStreamEvent {
  type: "started";
  sessionId: string;
  timestamp: string;
}

export interface AgentStepEvent extends AgentStreamEvent {
  type: "step";
  phase: AgentPhase;
  message: string;
  progress: number; // 0-100
}

export interface AgentToolCallEvent extends AgentStreamEvent {
  type: "tool_call";
  toolName: string;
  status: "STARTED" | "COMPLETED";
  toolCallIndex: number;
  message: string;
}

export interface AgentCompletedEvent extends AgentStreamEvent {
  type: "completed";
  data: AgentExecutionResult;
}

export interface AgentFailedEvent extends AgentStreamEvent {
  type: "failed";
  code: string;
  message: string;
}
```

### 4.2 SSE 클라이언트 유틸리티

```typescript
// lib/agent-stream.ts (신규 생성)

export async function runAgentStream(
  req: AgentRunRequest,
  onEvent: (event: AgentStreamEvent) => void,
  signal?: AbortSignal,
): Promise<AgentExecutionResult> {
  const res = await fetch("/api/bff/agent/run/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    credentials: "include",
    signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: AgentExecutionResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    let eventType = "";
    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:") && eventType) {
        const data = JSON.parse(line.slice(5).trim());
        const event = { type: eventType, ...data };
        onEvent(event);
        if (eventType === "completed") result = data;
        eventType = "";
      }
    }
  }

  if (!result) throw new Error("Stream ended without completion");
  return result;
}
```

### 4.3 진행 상태 UI 컴포넌트

`AgentTypingIndicator`를 `AgentProgressIndicator`로 확장:

```
┌─────────────────────────────────────────────────┐
│  ■ ■ ■  데이터를 분석하고 있습니다...              │
│                                                   │
│  ████████████████████░░░░░░░░  60%               │
│                                                   │
│  ✓ search_emerging_techs (15건 결과)              │
│  ● get_emerging_tech_statistics (분석 중...)       │
│                                                   │
│  경과 시간: 8초                                    │
└─────────────────────────────────────────────────┘
```

표시 요소:
- **현재 단계** 텍스트 (`step.message`)
- **진행률 바** (`step.progress`, 0-100%)
- **Tool 호출 로그** (`tool_call` 이벤트 누적 표시)
- **경과 시간** (프론트엔드 타이머)

### 4.4 수정 대상 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/types/agent.ts` | SSE 이벤트 타입 추가 |
| `src/lib/agent-stream.ts` | **신규** — SSE 클라이언트 유틸리티 |
| `src/components/agent/agent-progress-indicator.tsx` | **신규** — 진행 상태 UI (AgentTypingIndicator 대체) |
| `src/components/agent/agent-message-area.tsx` | `AgentTypingIndicator` → `AgentProgressIndicator` 교체 |
| `src/app/agent/page.tsx` | `handleSendGoal`에서 `runAgent` → `runAgentStream` 전환, 진행 상태 state 관리 |
| `src/app/api/bff/agent/run/stream/route.ts` | **신규** — BFF SSE 프록시 (HttpOnly Cookie → Bearer Token 변환) |

### 4.5 page.tsx 상태 변경 예시

```typescript
// 추가 state
const [streamProgress, setStreamProgress] = useState<{
  phase: string;
  message: string;
  progress: number;
  toolCalls: Array<{ name: string; status: string; message: string }>;
} | null>(null);

// handleSendGoal 내부 변경
const res = await runAgentStream(
  { goal: trimmed, sessionId: sessionId ?? undefined },
  (event) => {
    if (event.type === "step") {
      setStreamProgress(prev => ({
        ...prev!,
        phase: event.phase,
        message: event.message,
        progress: event.progress,
        toolCalls: prev?.toolCalls ?? [],
      }));
    } else if (event.type === "tool_call") {
      setStreamProgress(prev => ({
        ...prev!,
        toolCalls: [...(prev?.toolCalls ?? []), {
          name: event.toolName,
          status: event.status,
          message: event.message,
        }],
      }));
    }
  },
);
```

---

## 5. 구현 우선순위 및 단계

### Phase 1: 백엔드 SSE 엔드포인트 구현 (백엔드팀)

1. `POST /api/v1/agent/run/stream` 엔드포인트 추가
2. LangChain4j Agent 실행 중 단계별 콜백 연동
3. SSE 이벤트 형식 확정 및 구현
4. Gateway SSE 프록시 설정 (타임아웃 연장, 버퍼링 비활성화)
5. 기존 `/run` 엔드포인트 유지 (하위 호환성)

### Phase 2: 프론트엔드 SSE 소비 및 UI (프론트엔드)

1. SSE 클라이언트 유틸리티 구현 (`agent-stream.ts`)
2. BFF SSE 프록시 라우트 추가
3. `AgentProgressIndicator` 컴포넌트 구현
4. `page.tsx` 상태 관리 및 `runAgentStream` 연동
5. Fallback: SSE 실패 시 기존 동기 API로 자동 전환

### Phase 3: 고도화

1. 실행 취소 (Abort) 기능 — `AbortController` 활용
2. Tool 호출 로그 펼침/접기 UI
3. 에러 발생 시 부분 결과 표시
4. SSE 연결 끊김 시 자동 재연결

---

## 6. 인프라 고려사항

| 항목 | 설명 |
|------|------|
| Gateway 타임아웃 | SSE 연결은 최소 120초 유지 필요 (현재 Agent 최대 60초 + 여유) |
| Nginx/ALB 버퍼링 | `X-Accel-Buffering: no` 헤더 필요, proxy_buffering off 설정 |
| CORS | SSE는 일반 HTTP이므로 추가 설정 불필요 (기존 CORS 정책 적용) |
| BFF 프록시 | Next.js Route Handler에서 SSE 응답을 `ReadableStream`으로 전달 |
| 연결 관리 | 클라이언트 이탈 시 서버 측 정리 로직 필요 (Agent 실행은 계속 vs 중단) |

---

## 7. 백엔드팀 협의 체크리스트

- [ ] SSE 엔드포인트 URL 및 HTTP 메서드 확정 (`POST /run/stream` vs `GET /run/{id}/stream`)
- [ ] 이벤트 타입 및 데이터 스키마 확정
- [ ] LangChain4j 콜백에서 어떤 단계 정보를 추출할 수 있는지 확인
- [ ] Tool 호출 시작/완료 이벤트 제공 가능 여부 확인
- [ ] 진행률(progress %) 계산 가능 여부 — 불가능 시 단계(phase)만 제공
- [ ] Gateway SSE 프록시 설정 담당자 확인
- [ ] 기존 `/run` 엔드포인트 폐기 시점 합의 (또는 영구 유지)
- [ ] 클라이언트 연결 중단 시 Agent 실행 정책 (계속 실행 vs 중단)

---

## 8. 참고 자료

- [OpenAI Assistants API Streaming](https://platform.openai.com/docs/assistants/overview?context=with-streaming) — SSE 기반 Agent 실행 스트리밍 레퍼런스
- [Anthropic Messages API Streaming](https://docs.anthropic.com/en/api/messages-streaming) — SSE 이벤트 설계 참고
- [MDN Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) — Web 표준 SSE 스펙
- [Spring WebFlux SSE](https://docs.spring.io/spring-framework/reference/web/webflux/reactive-spring.html) — Spring 기반 SSE 구현 참고
- [LangChain4j Streaming](https://docs.langchain4j.dev/tutorials/ai-services#streaming) — LangChain4j 스트리밍 지원
