# Agent 실행 페이지 + 네비게이션 PRD 작성 프롬프트

---

## 사용법

아래 프롬프트를 LLM에 입력하여 PRD를 생성한다. `<api-spec>` 영역에 Agent API 설계서 전문을, `<chatbot-api-spec>` 영역에 Chatbot API 설계서 전문을 삽입한다.

---

## 프롬프트

```
당신은 시니어 프론트엔드 프로덕트 매니저입니다. 아래 제공하는 Agent API 설계서와 요구사항을 기반으로 Admin App의 AI Agent 실행 페이지 프론트엔드 PRD(Product Requirements Document)를 작성하세요.

# 역할
- 프론트엔드 PRD 작성 전문가
- API 스펙을 읽고 프론트엔드 관점의 요구사항으로 변환
- AI Agent 관리자 도구 UI/UX 베스트 프랙티스에 정통
- 클린 코드 원칙과 업계 표준에 정통

# 입력 자료

<api-spec>
{여기에 docs/API-specifications/api-agent-specification.md 전문 삽입}
</api-spec>

<chatbot-api-spec>
{여기에 docs/API-specifications/api-chatbot-specification.md 전문 삽입 — 참조 패턴용}
</chatbot-api-spec>

# 프로젝트 기본 정보

| 항목 | 내용 |
|------|------|
| 앱 이름 | Admin App |
| 앱 위치 | `/admin` (독립된 별도 Next.js 프로젝트) |
| 기술 스택 | Next.js 16 (App Router) + React 19 + TypeScript |
| UI 라이브러리 | Radix UI + CVA (class-variance-authority) |
| 스타일링 | Tailwind CSS v4 + 커스텀 Neo-Brutalism 유틸리티 |
| 아이콘 | Lucide React |
| 폰트 | Space Grotesk (sans), DM Mono (mono) |
| 디자인 테마 | Neo-Brutalism |
| 색상 테마 | Primary Blue (#3B82F6), Accent Light Blue (#DBEAFE), Black (#000000), White (#FFFFFF), Gray (#F5F5F5), Destructive Red (#EF4444) |
| Markdown 렌더링 | react-markdown + remark-gfm (설치 완료) |
| API Gateway | http://localhost:8081 (Next.js rewrites로 /api/* → Gateway 프록시) |
| 인증 | JWT 기반 (Bearer 토큰, ADMIN 권한). Gateway에서 역할 검증 수행 |
| UI 언어 | 영문 (화면에 표시되는 모든 텍스트는 영문 사용) |

# 기존 코드베이스 컨텍스트

## 구현 완료된 기능 (Admin App)
1. **관리자 로그인 (`/signin`)**: 관리자 전용 로그인
2. **대시보드 (`/`)**: Account Management 카드 + 네비게이션
3. **계정 관리 (`/accounts`)**: 관리자 계정 CRUD 테이블

## 구현 완료된 Agent API 레이어 (이번 PRD에서 재사용)
- `types/agent.ts`: AgentRunRequest, AgentExecutionResult, SessionResponse, MessageResponse, PageData<T>, SessionListResponse, MessageListResponse, SessionListParams, MessageListParams
- `lib/agent-api.ts`: runAgent(), fetchAgentSessions(), fetchAgentSessionDetail(), fetchAgentSessionMessages(), deleteAgentSession()
- `lib/auth-fetch.ts`: Agent 관련 에러 메시지 코드 추가 완료 (GOAL_EMPTY, AGENT_EXECUTION_ERROR, INVALID_SESSION_ID, SESSION_FORBIDDEN, SESSION_NOT_FOUND)

## 참조: 사용자 앱(`/app`)의 Chatbot 구현 패턴
Agent 페이지는 사용자 앱의 Chatbot 페이지(`/app/src/app/chat/page.tsx`)와 유사한 구조를 가지되, 아래 차이점을 반영한다. Chatbot API 설계서를 참조 패턴으로 제공하니 구조적 유사성과 차이점을 PRD에 반영하라.

### Chatbot과 Agent의 핵심 차이점

| 항목 | Chatbot (사용자 앱) | Agent (Admin App) |
|------|---------------------|-------------------|
| 대상 사용자 | 일반 사용자 | ADMIN 역할 |
| 입력 필드 | `message` (Max 500자) | `goal` (자연어, 길이 제한 없음) |
| 세션 ID 필드 | `conversationId` | `sessionId` |
| 응답 타입 | `ChatResponse` (response, sources) | `AgentExecutionResult` (success, summary, 메타데이터) |
| 응답 시간 | 수 초 | 10~60초 (LLM + 외부 API) |
| 응답 콘텐츠 | 일반 텍스트 | Markdown (표, 코드 블록, Mermaid 가능) |
| 소스 인용 | SourceResponse[] 배열 | 없음 (summary에 자연어로 포함) |
| 세션 타이틀 수정 | PATCH 엔드포인트 있음 | 엔드포인트 없음 |
| 실행 메타데이터 | 없음 | toolCallCount, analyticsCallCount, executionTimeMs, errors |

## 디자인 시스템: Neo-Brutalism
- `.brutal-shadow`: box-shadow 4px 4px 0px 0px #000000
- `.brutal-shadow-sm`: box-shadow 2px 2px 0px 0px #000000
- `.brutal-shadow-lg`: box-shadow 6px 6px 0px 0px #000000
- `.brutal-border`: border 2px solid #000000
- `.brutal-border-3`: border 3px solid #000000
- `.brutal-hover`: hover 시 translate(2px, 2px) + shadow 축소, active 시 translate(4px, 4px) + shadow 제거
- border-radius: 0 (모든 요소 직각, --radius: 0rem)
- 색상 변수: --primary (#3B82F6), --accent (#DBEAFE), --secondary (#F5F5F5), --destructive (#EF4444), --foreground (#000000), --background (#FFFFFF)

## 인증 인프라 (재사용 대상)
- `lib/auth-fetch.ts`: `authFetch()` — JWT Authorization 헤더 자동 첨부, 401 시 토큰 자동 갱신, 갱신 실패 시 로그인 페이지 리다이렉트. `parseResponse<T>()`, `parseVoidResponse()` — ApiResponse<T> 파싱 및 에러 처리. `AuthError` 클래스, `getErrorMessage()` 에러 코드 매핑
- `contexts/auth-context.tsx`: `useAuth()` — user, isLoading, login, logout 제공
- `contexts/toast-context.tsx`: `useToast()` — 토스트 알림 제공

## 기존 API 클라이언트 패턴

```typescript
// lib/agent-api.ts (구현 완료)
import { authFetch, parseResponse, parseVoidResponse } from "@/lib/auth-fetch";
import { toQueryString } from "@/lib/utils";

const BASE = "/api/v1/agent";

export async function runAgent(req: AgentRunRequest): Promise<AgentExecutionResult> {
  const res = await authFetch(`${BASE}/run`, {
    method: "POST",
    body: JSON.stringify(req),
  });
  return parseResponse<AgentExecutionResult>(res);
}

export async function fetchAgentSessions(params: SessionListParams = {}): Promise<SessionListResponse> {
  const res = await authFetch(`${BASE}/sessions${toQueryString(params)}`);
  return parseResponse<SessionListResponse>(res);
}

export async function fetchAgentSessionMessages(sessionId: string, params: MessageListParams = {}): Promise<MessageListResponse> {
  const res = await authFetch(`${BASE}/sessions/${encodeURIComponent(sessionId)}/messages${toQueryString(params)}`);
  return parseResponse<MessageListResponse>(res);
}

export async function deleteAgentSession(sessionId: string): Promise<void> {
  const res = await authFetch(`${BASE}/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
  return parseVoidResponse(res);
}
```

## 기존 타입 정의

```typescript
// types/agent.ts (구현 완료)
export interface AgentRunRequest {
  goal: string;
  sessionId?: string;
}

export interface AgentExecutionResult {
  success: boolean;
  summary: string;
  sessionId: string;
  toolCallCount: number;
  analyticsCallCount: number;
  executionTimeMs: number;
  errors: string[];
}

export interface SessionResponse {
  sessionId: string;
  title: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  isActive: boolean;
}

export interface MessageResponse {
  messageId: string;
  sessionId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  tokenCount?: number;
  sequenceNumber: number;
  createdAt: string;
}

export interface SessionListResponse {
  data: PageData<SessionResponse>;
}

export interface MessageListResponse {
  data: PageData<MessageResponse>;
}
```

## 현재 프로젝트 디렉토리 구조

```
admin/src/
├── app/
│   ├── layout.tsx              (루트 레이아웃)
│   ├── page.tsx                (대시보드 — Agent 카드 추가 필요)
│   ├── globals.css
│   ├── signin/page.tsx
│   └── accounts/page.tsx
├── components/
│   ├── ui/                     (button, input, dialog, badge, alert-dialog, toast)
│   ├── auth/
│   │   ├── header.tsx          (헤더 — Agent 네비게이션 추가 필요)
│   │   └── signin-form.tsx
│   └── admin/                  (accounts-table, create/edit/detail/delete-dialog)
├── contexts/
│   ├── auth-context.tsx
│   └── toast-context.tsx
├── lib/
│   ├── admin-api.ts
│   ├── agent-api.ts            (구현 완료)
│   ├── auth-api.ts
│   ├── auth-fetch.ts
│   ├── cookie-config.ts
│   └── utils.ts                (cn, toQueryString)
└── types/
    ├── admin.ts
    ├── agent.ts                (구현 완료)
    └── auth.ts
```

# 기능 요구사항

## 목적
관리자가 AI Agent를 실행하고 대화 이력을 관리할 수 있는 페이지를 구현한다. Agent는 자연어 goal을 받아 데이터 수집, 검색, 분석 등을 자율 수행하고, Markdown 형태의 결과를 반환한다.

## 전제 조건
- ADMIN 역할 JWT 인증 필요 (비인증 시 로그인 리다이렉트)
- Agent 실행은 동기 방식 (10~60초 소요, 스트리밍/폴링 없음)
- Agent 응답의 `summary`에 Markdown이 포함될 수 있음 → react-markdown + remark-gfm으로 렌더링
- API 레이어(types/agent.ts, lib/agent-api.ts)는 구현 완료 상태 — 그대로 재사용

## F1. Agent 실행 (Goal 전송)
- 사용 API: `POST /api/v1/agent/run`
- 관리자가 goal을 입력하고 Agent를 실행
- Request: `{ goal: string (NotBlank), sessionId?: string }`
- Response: `AgentExecutionResult` (success, summary, sessionId, toolCallCount, analyticsCallCount, executionTimeMs, errors)
- sessionId가 없으면 새 세션 자동 생성, 응답의 sessionId로 후속 요청에 재사용
- 실행 중 로딩 상태: 스피너 + "Agent is working... This may take up to a minute." 안내 메시지 표시
- 빈 goal 전송 방지 (클라이언트 검증)
- 실행 중 중복 전송 방지 (입력/전송 비활성화)

## F2. 실행 결과 표시
- ASSISTANT 메시지로 `summary`를 Markdown 렌더링하여 표시 (react-markdown + remark-gfm)
- 실행 메타데이터를 결과 하단에 요약 카드로 표시:
  - `success`: 성공/실패 뱃지
  - `toolCallCount` + `analyticsCallCount`: Tool 호출 횟수
  - `executionTimeMs`: 실행 시간 (초 단위로 변환, 예: "12.5s")
  - `errors`: 에러 목록 (비어있으면 미표시, 있으면 경고 스타일로 나열)
- USER 메시지(goal 입력)는 일반 텍스트로 표시 (Markdown 렌더링하지 않음)

## F3. 세션 목록 사이드바
- 사용 API: `GET /api/v1/agent/sessions`
- 사이드바에 세션 목록 표시, lastMessageAt 기준 내림차순
- 페이지네이션: page 1부터, size 기본 20, "Load more" 버튼으로 추가 로드
- 세션 클릭 시 해당 세션의 대화 이력 로드
- 세션 삭제 액션 (X 버튼, hover 시 표시)
- 세션 타이틀 수정 기능은 미포함 (Agent API에 해당 엔드포인트 없음)
- "New Session" 버튼으로 새 세션 시작

## F4. 대화 이력 로드
- 사용 API: `GET /api/v1/agent/sessions/{sessionId}/messages`
- 선택한 세션의 메시지 목록을 sequenceNumber 오름차순으로 표시
- 페이지네이션: page 1부터, size 기본 50
- 최신 메시지 우선 표시: 초기 로드 시 마지막 페이지부터 로드
- 이전 메시지 로드: 스크롤 상단 도달 시 이전 페이지 프리펜드 (infinite scroll up)
- ASSISTANT 메시지는 Markdown 렌더링 적용, USER 메시지는 일반 텍스트

## F5. 세션 삭제
- 사용 API: `DELETE /api/v1/agent/sessions/{sessionId}`
- 삭제 전 확인 다이얼로그 (AlertDialog)
- 삭제 성공 시 세션 목록에서 제거 + 토스트
- 현재 활성 세션 삭제 시 빈 상태로 전환

## F6. 새 세션 시작
- "New Session" 버튼으로 현재 대화 초기화
- sessionId를 null로 설정
- 첫 goal 전송 시 서버에서 새 sessionId 반환

## F7. Dashboard 업데이트 (`/` 페이지)
- 기존 "Account Management" 카드 아래에 "AI Agent" 카드 추가
- 카드 내용: "Run AI Agent for data collection, analysis, and monitoring." + `/agent` 링크 버튼
- 기존 카드와 동일한 Neo-Brutalism 스타일 적용

## F8. Header 네비게이션 업데이트
- 기존 "Accounts" 링크 옆에 "Agent" 네비게이션 링크 추가
- `/agent` 페이지 활성 시 Primary Blue 색상 하이라이트
- 기존 네비게이션 패턴과 동일한 스타일

## F9. Empty State
- 새 대화 시작 시 (세션 미선택 + 메시지 없음) Empty State 표시
- AI Agent 아이콘 + "Welcome to AI Agent" 타이틀
- 설명: "Give the agent a goal and it will autonomously collect, search, and analyze emerging tech data."
- 예시 goal 버튼 3개:
  - "Collect latest AI releases from GitHub"
  - "Analyze recent trends in AI model releases"
  - "Search for OpenAI updates this month"

# AI Agent 관리 도구 UI/UX 베스트 프랙티스 가이드

PRD 작성 시 아래 업계 표준 베스트 프랙티스를 반영하세요:

## 메시지 UI
1. **메시지 역할 구분**: USER goal은 우측 정렬 + Primary Blue, ASSISTANT summary는 좌측 정렬 + Secondary 배경. 직각 border-radius.
2. **Markdown 렌더링**: ASSISTANT 응답은 Markdown으로 렌더링 (표, 코드 블록, 리스트 등). USER 메시지는 일반 텍스트.
3. **메시지 타임스탬프**: 각 메시지에 생성 시간 표시.
4. **자동 스크롤**: 새 메시지 수신 시 자동 스크롤. 사용자가 이전 메시지를 읽고 있을 때는 자동 스크롤 중지 + "Scroll to bottom" 버튼 표시.

## Agent 실행 특화
5. **장시간 실행 대응**: 10~60초 소요되므로 명확한 로딩 상태 필수. 스피너 + 예상 시간 안내 텍스트.
6. **실행 메타데이터 카드**: 실행 결과의 toolCallCount, executionTimeMs 등을 시각적 카드로 요약 표시하여 Agent 활동 투명성 확보.
7. **에러 표시**: AgentExecutionResult.errors 배열이 비어있지 않으면 경고 스타일로 에러 목록 표시.
8. **성공/실패 뱃지**: success 필드에 따라 녹색(Success)/빨간색(Failed) 뱃지 표시.

## 대화 관리
9. **세션 사이드바**: 이전 대화 목록을 사이드바에 표시. 타이틀이 null이면 "New Session" 표시.
10. **Empty State**: 첫 사용 시 안내 메시지와 예시 goal 버튼 제공.
11. **입력 영역**: 하단 고정. Enter로 전송, Shift+Enter로 줄바꿈. goal은 길이 제한 없으므로 textarea가 적합.

## 에러 및 상태 처리
12. **Loading States**: 세션 목록, 메시지 이력, Agent 실행 각각 적절한 로딩 UI. Agent 실행 로딩은 일반 메시지 전송보다 훨씬 긴 시간이 소요되므로 특별한 처리 필요.
13. **Error States**: API 에러 시 토스트 알림. Agent 실행 실패 시 재시도 옵션 제공.
14. **재시도**: goal 전송 실패 시 실패 메시지에 Retry 버튼 제공.

## 디자인 일관성
15. **Admin App 테마 일관성**: 기존 Accounts 페이지와 완전히 동일한 Neo-Brutalism 디자인. brutal-shadow, brutal-border, brutal-hover 유틸리티 클래스 활용.
16. **기존 컴포넌트 재사용**: AlertDialog(삭제 확인), Toast(피드백), Badge(상태 표시) 등 기존 UI 컴포넌트 재사용.

# 보안 요구사항

PRD에 아래 보안 사항을 반드시 명시하세요:

1. **XSS 방지**: Markdown 렌더링 시 react-markdown의 기본 sanitization에 의존. `rehype-raw` 사용 금지 (raw HTML 삽입 차단). `allowedElements`를 명시적으로 제한하거나, 기본 allowlist 사용.
2. **입력 검증**: goal 빈 값 방지 (클라이언트 + 서버 이중 검증).
3. **JWT 토큰 관리**: 기존 `authFetch` 인프라 재사용. ADMIN 역할 검증은 Gateway에서 수행.
4. **세션 접근 제어**: 다른 사용자의 세션 접근 시 403 에러 처리.
5. **전송 중복 방지**: Agent 실행 중 전송 버튼 비활성화 및 입력 잠금.

# 출력 형식

아래 구조를 따라 PRD를 작성하세요. 각 섹션은 반드시 포함되어야 합니다.

## PRD 구조

1. **개요**: 프로젝트 기본 정보 테이블. Chatbot과 Agent의 핵심 차이점 비교 테이블. 기존 구현 완료 사항(types, API layer) 명시
2. **API 연동**: Agent API 엔드포인트 5개 목록. 각 API의 요청 파라미터, 응답 필드, 에러 코드 정리. 공통 응답 형식(ApiResponse<T>) 명시. 이미 구현된 API 클라이언트 함수 매핑
3. **페이지 구조**: 신규/수정 페이지 목록과 각 페이지의 ASCII 와이어프레임
   - `/agent` (신규) — Agent 실행 페이지 (사이드바 + 대화 영역)
   - `/` (수정) — Dashboard에 Agent 카드 추가
4. **컴포넌트 상세**:
   - Agent 사이드바: 세션 목록, 새 세션 버튼, 세션 삭제, Load more (타이틀 수정 없음)
   - 메시지 영역: USER/ASSISTANT 메시지 버블, Markdown 렌더링(ASSISTANT만), 실행 메타데이터 카드, 자동 스크롤, 이전 메시지 로드
   - Goal 입력 영역: textarea, 전송 버튼, 키보드 단축키
   - Agent 로딩 인디케이터: 장시간 실행 대응 (스피너 + 안내 메시지)
   - 실행 메타데이터 카드: success 뱃지, toolCallCount, executionTimeMs, errors
   - 세션 삭제 확인 다이얼로그
   - Empty State: Agent 안내, 예시 goal 버튼
   - Header: "Agent" 네비게이션 링크 추가
   - Dashboard: "AI Agent" 카드 추가
5. **디자인 가이드**: Neo-Brutalism 일관성. Markdown 콘텐츠 스타일링 (표, 코드 블록, 리스트). 메타데이터 카드 레이아웃
6. **보안 사항**: Markdown XSS 방지, 입력 검증, JWT 관리, 세션 접근 제어, 중복 전송 방지
7. **기술 구현 사항**: 추가 디렉토리/파일 구조 (components/agent/*, app/agent/page.tsx). 기존 types/agent.ts, lib/agent-api.ts 재사용. react-markdown + remark-gfm 활용. Chatbot 구현 패턴 참조 사항 (재사용 가능한 패턴: race condition guard, infinite scroll up, optimistic UI 등)
8. **접근성**: 채팅 영역 role="log", aria-label, 키보드 네비게이션, 로딩 상태 aria-live
9. **범위 제한**: 포함/미포함 항목 명시

# 제약 조건

- API 스펙에 정의된 필드명, 파라미터명을 그대로 사용한다. 특히: goal (message가 아님), sessionId (conversationId가 아님), summary, toolCallCount, analyticsCallCount, executionTimeMs, errors.
- API Gateway(8081)로 일괄 요청한다. Next.js rewrites `/api/*` → `http://localhost:8081/api/*` 프록시를 활용한다.
- 기존 Admin App의 디자인 시스템을 그대로 따른다. Accounts 페이지와 시각적 일관성 유지.
- 기존 컴포넌트 라이브러리(Radix UI, CVA, Lucide 아이콘)를 활용한다.
- 기존 인증 인프라(authFetch, parseResponse, useAuth, useToast)를 재사용한다.
- 이미 구현된 API 레이어(types/agent.ts, lib/agent-api.ts)를 그대로 사용한다. 중복 구현하지 않는다.
- 화면에 표시되는 모든 텍스트는 영문을 사용한다.
- Agent 응답은 비스트리밍(동기식) 방식이다. SSE, WebSocket, 폴링 등 스트리밍 구현을 추가하지 않는다.
- 세션 타이틀 수정 기능은 미포함한다 (Agent API에 해당 엔드포인트 없음).
- Chatbot 구현의 검증된 패턴(race condition guard with useRef, isLoadingOlderRef, infinite scroll up with scroll position preservation)을 참고하되, Agent의 차이점(goal vs message, 메타데이터 카드, Markdown 렌더링, 장시간 실행)을 반영하여 설계한다.
- 오버엔지니어링하지 않는다. 요구사항에 명시되지 않은 기능(스트리밍, 실시간 진행 상태, Agent 설정 커스터마이징, 다크 모드, Tool 실행 상세 로그 UI 등)을 추가하지 않는다.
```

---

## 프롬프트 엔지니어링 기법 설명

| 기법 | 적용 위치 | 설명 |
|------|----------|------|
| Role Prompting | `# 역할` | 시니어 PM + AI Agent 관리 도구 전문가 + 클린 코드 전문가 역할 부여 |
| Structured Input | `<api-spec>`, `<chatbot-api-spec>` 태그 | API 설계서를 명확한 경계로 구분 제공. Chatbot 스펙은 참조 패턴으로 별도 제공 |
| Comparative Grounding | `### Chatbot과 Agent의 핵심 차이점` 테이블 | 유사 기능(Chatbot)과의 명시적 비교표로 차이점을 구조화하여 혼동 방지 |
| Pre-built Context | `## 구현 완료된 Agent API 레이어` | 이미 구현된 코드(types, API 함수)를 명시하여 중복 구현 방지 및 정확한 재사용 유도 |
| Code Snippet Grounding | `## 기존 API 클라이언트 패턴`, `## 기존 타입 정의` | 실제 코드를 전문 제공하여 LLM이 정확한 타입/함수명으로 설계하도록 강제 |
| Explicit Output Format | `# 출력 형식` > `## PRD 구조` | 9개 섹션 구조를 번호로 지정하여 누락 방지 |
| Enumerated Features | `# 기능 요구사항` F1~F9 | 9개 기능을 코드 번호로 나열, 각 기능에 사용 API와 필드를 명시하여 모호성 제거 |
| Domain-Specific Best Practices | `# AI Agent 관리 도구 UI/UX 베스트 프랙티스 가이드` | 장시간 실행 대응, 메타데이터 카드, Markdown 렌더링 등 Agent 특화 UX 패턴 16개 항목 |
| Security Specification | `# 보안 요구사항` | Markdown XSS, rehype-raw 금지 등 Agent 특화 보안 사항을 별도 섹션으로 분리 |
| Negative Constraint | `# 제약 조건` | 스트리밍 미지원, 타이틀 수정 미포함, 오버엔지니어링 방지 등 금지 사항 명시 |
| Cross-Reference Pattern | `## 참조: 사용자 앱의 Chatbot 구현 패턴` | 기존 검증된 구현 패턴(race condition guard, infinite scroll)을 명시적으로 참조하되 차이점 반영 지시 |
| Directory Structure Anchoring | `## 현재 프로젝트 디렉토리 구조` | 현재 파일 구조를 정확히 제시하여 새 파일 위치를 올바르게 설계하도록 유도 |
