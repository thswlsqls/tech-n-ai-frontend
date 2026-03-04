# 세션 타이틀 기능 PRD 작성 프롬프트

---

## 사용법

아래 프롬프트를 LLM에 입력하여 PRD를 생성한다. `<api-spec>` 영역에 세션 타이틀 자동 생성 개선 설계서 전문을 삽입한다.

---

## 프롬프트

```
당신은 시니어 프론트엔드 프로덕트 매니저입니다. 아래 제공하는 세션 타이틀 자동 생성 API 설계서와 요구사항을 기반으로, 기존 챗봇 UI에 세션 타이틀 기능을 추가하는 프론트엔드 PRD(Product Requirements Document)를 작성하세요.

# 역할
- 프론트엔드 PRD 작성 전문가
- API 스펙을 읽고 프론트엔드 관점의 요구사항으로 변환
- 챗봇 세션 관리 UI/UX 베스트 프랙티스에 정통

# 입력 자료

<api-spec>
{여기에 docs/API-specifications/api-chatbot/3-session-title-generation-design.md 전문 삽입}
</api-spec>

# 프로젝트 기본 정보

| 항목 | 내용 |
|------|------|
| 기술 스택 | Next.js 16 (App Router) + React 19 + TypeScript |
| UI 라이브러리 | Radix UI + CVA (class-variance-authority) |
| 스타일링 | Tailwind CSS v4 + 커스텀 Neo-Brutalism 유틸리티 |
| 아이콘 | Lucide React |
| 폰트 | Space Grotesk (sans), DM Mono (mono) |
| 디자인 테마 | Neo-Brutalism |
| 색상 테마 | Primary Blue (#3B82F6), Accent Light Blue (#DBEAFE), Black (#000000), White (#FFFFFF), Gray (#F5F5F5), Destructive Red (#EF4444) |
| API Gateway | http://localhost:8081 (Next.js rewrites로 /api/* → Gateway 프록시) |
| 인증 | JWT 기반 (Bearer 토큰). 모든 Chatbot API는 인증 필요 |
| UI 언어 | 영문 (화면에 표시되는 모든 텍스트는 영문 사용) |

# 기존 구현 현황

## 챗봇 기능 구현 완료 항목
아래 기능들은 이미 구현되어 있으며, 이번 PRD의 범위가 아닙니다:
1. **채팅 메시지 전송/수신**: POST /api/v1/chatbot → ChatResponse (response, conversationId, sources)
2. **세션 목록 사이드바**: GET /sessions → 사이드바에 세션 목록 표시 (title, lastMessageAt)
3. **대화 내역 로드**: GET /sessions/{id}/messages → 메시지 목록 표시
4. **새 대화 시작**: "New Chat" 버튼, conversationId null로 초기화
5. **세션 삭제**: DELETE /sessions/{id} → 확인 다이얼로그 후 삭제
6. **RAG 소스 인용 표시**: sources 배열 렌더링

## 타이틀 관련 이미 구현된 부분
아래 코드는 이미 존재하며, 이번 PRD에서 활용해야 합니다:

### 타입 정의 (types/chatbot.ts)
```typescript
export interface ChatResponse {
  response: string;
  conversationId: string;
  title?: string;         // 이미 정의됨
  sources?: SourceResponse[];
}

export interface SessionResponse {
  sessionId: string;
  title?: string;          // 이미 정의됨
  createdAt: string;
  lastMessageAt?: string;
  isActive: boolean;
}
```

### API 클라이언트 (lib/chatbot-api.ts)
```typescript
// 이미 구현됨
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<SessionResponse> {
  const res = await authFetch(
    `${BASE}/sessions/${encodeURIComponent(sessionId)}/title`,
    { method: "PATCH", body: JSON.stringify({ title }) }
  );
  return parseResponse<SessionResponse>(res);
}
```

### 채팅 페이지 (app/chat/page.tsx) - 새 세션 타이틀 처리
```typescript
// 새 세션 생성 시 타이틀 optimistic 반영 (이미 구현됨)
if (isNewSession) {
  setActiveSessionId(res.conversationId);
  const newSession: SessionResponse = {
    sessionId: res.conversationId,
    title: res.title,    // ChatResponse의 title 사용
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    isActive: true,
  };
  setSessions((prev) => [newSession, ...prev]);
  loadSessions(); // 백그라운드에서 서버 데이터 동기화
} else if (res.title) {
  // 기존 세션 타이틀 업데이트 (이미 구현됨)
  setSessions((prev) =>
    prev.map((s) =>
      s.sessionId === res.conversationId
        ? { ...s, title: res.title }
        : s
    )
  );
}
```

## 인증 인프라 (재사용 대상)
- `lib/auth-fetch.ts`: `authFetch()`, `parseResponse<T>()`, `parseVoidResponse()`, `AuthError`
- `contexts/auth-context.tsx`: `useAuth()` — user, isLoading, login, logout
- `contexts/toast-context.tsx`: `useToast()` — 토스트 알림

## 디자인 시스템: Neo-Brutalism
- `.brutal-shadow`: box-shadow 4px 4px 0px 0px #000000
- `.brutal-shadow-sm`: box-shadow 2px 2px 0px 0px #000000
- `.brutal-border`: border 2px solid #000000
- `.brutal-border-3`: border 3px solid #000000
- `.brutal-hover`: hover 시 translate(2px, 2px) + shadow 축소
- border-radius: 0 (모든 요소 직각, --radius: 0rem)

## 현재 사이드바 컴포넌트 구조
```
components/chatbot/
├── chat-sidebar.tsx        (세션 목록, 새 대화 버튼, 삭제 액션)
├── chat-message-area.tsx   (메시지 버블, 타이핑 인디케이터, 자동 스크롤)
├── chat-input.tsx          (메시지 입력 영역)
└── chat-delete-dialog.tsx  (세션 삭제 확인 다이얼로그)
```

# 기능 요구사항

이번 PRD에서 다루는 범위는 **세션 타이틀 표시 및 편집**에 한정됩니다.

## F1. 사이드바 타이틀 표시 개선
- 사이드바 세션 목록에서 세션 타이틀을 표시
- 타이틀이 null인 경우 (비동기 생성 대기 중): "New Chat" 폴백 텍스트 표시
- 긴 타이틀은 한 줄로 표시하고 말줄임(text-overflow: ellipsis) 처리
- 타이틀이 null인 세션은 폴백 텍스트와 시각적으로 구분 (예: italic 스타일)

## F2. 비동기 생성 타이틀 동기화
- 새 세션 생성 시 ChatResponse.title은 null (서버에서 비동기 생성 중)
- 새 세션 생성 후 세션 목록을 백그라운드 재조회하여 생성된 타이틀을 동기화
- 이미 구현된 `loadSessions()` 백그라운드 호출을 활용
- 타이틀이 동기화되면 사이드바에 자연스럽게 반영

## F3. 세션 타이틀 인라인 편집
- 사용 API: `PATCH /api/v1/chatbot/sessions/{sessionId}/title`
- 사이드바 세션 항목에 편집 아이콘(Pencil) 표시 (hover 시)
- 편집 아이콘 클릭 시 타이틀을 인라인 텍스트 입력으로 전환
- Enter 키로 저장, Escape 키로 취소
- 저장 시 Optimistic UI: 즉시 UI 반영, API 실패 시 이전 타이틀로 롤백 + 에러 토스트
- 입력 검증: 빈 타이틀 방지, 200자 제한
- Request Body: `{ title: string }` (NotBlank, Max 200)
- Response: `SessionResponse` (업데이트된 세션 정보)
- 에러: 400 (빈 타이틀, 200자 초과), 403 (권한 없음), 404 (세션 없음)

# 세션 타이틀 UI/UX 베스트 프랙티스 가이드

PRD 작성 시 아래 업계 표준 베스트 프랙티스를 반영하세요. ChatGPT, Microsoft Copilot, Open WebUI 등 주요 AI 챗봇 제품의 패턴을 참고한 내용입니다.

## 타이틀 표시
1. **자동 생성 타이밍**: 첫 메시지-응답 완료 후 서버에서 비동기 생성 (ChatGPT, Copilot, Open WebUI 공통 패턴)
2. **폴백 텍스트**: 타이틀이 아직 없는 세션은 "New Chat" 등 일관된 폴백 텍스트로 표시
3. **말줄임 처리**: 사이드바 너비에 맞게 긴 타이틀을 한 줄 말줄임 처리 (text-overflow: ellipsis)
4. **호버 시 전체 타이틀**: 긴 타이틀의 경우 마우스 호버 시 title 속성으로 전체 텍스트 표시

## 인라인 편집
5. **편집 진입**: 호버 시 Pencil 아이콘 표시, 클릭으로 편집 모드 진입 (ChatGPT 패턴)
6. **편집 UI**: 타이틀 텍스트가 인라인 input으로 전환, 기존 타이틀이 pre-fill
7. **키보드 인터랙션**: Enter로 저장, Escape로 취소 (업계 표준 인라인 편집 패턴)
8. **Optimistic UI**: 저장 시 즉시 UI 반영, 실패 시 이전 값으로 롤백 + 에러 토스트

## 비동기 동기화
9. **세션 목록 재조회**: 새 세션 생성 후 백그라운드 세션 목록 재조회로 타이틀 동기화
10. **자연스러운 전환**: "New Chat" 폴백 → 생성된 타이틀로 자연스럽게 전환

# 출력 형식

아래 구조를 따라 PRD를 작성하세요. 각 섹션은 반드시 포함되어야 합니다.

## PRD 구조

1. **개요**: 기능 목적 요약. 이번 PRD가 기존 챗봇 구현에 세션 타이틀 기능을 추가하는 증분(incremental) 작업임을 명시
2. **API 연동**: 이번 기능에서 사용하는 API 목록. `PATCH /sessions/{sessionId}/title` 신규 엔드포인트 상세 (요청/응답/에러). ChatResponse.title 필드 활용 방법
3. **컴포넌트 변경 상세**:
   - 사이드바 세션 항목: 타이틀 표시 (폴백, 말줄임, 호버), 인라인 편집 (Pencil 아이콘, input 전환, 키보드 핸들링, Optimistic UI)
   - 변경 대상 파일 목록과 각 파일의 수정 내용
4. **상태 관리**: 인라인 편집 상태 (editingSessionId, editingTitle), Optimistic UI 롤백 로직
5. **디자인 가이드**: Neo-Brutalism 스타일 적용. Pencil 아이콘 스타일, 인라인 input 스타일, 폴백 텍스트 스타일
6. **에러 처리**: API 에러별 사용자 피드백 (400, 403, 404), Optimistic UI 롤백 규칙
7. **접근성**: 편집 버튼 aria-label, 인라인 input aria-label, 키보드 네비게이션
8. **범위 제한**: 이번 PRD에 포함/미포함 항목 명시

# 제약 조건

- API 스펙에 정의된 필드명을 그대로 사용한다. 특히: title (String, nullable), sessionId (String).
- 기존 챗봇 컴포넌트 구조(chat-sidebar.tsx, chat-message-area.tsx 등)를 유지한다. 기존 파일을 수정하되 구조를 변경하지 않는다.
- 기존 인증 인프라(authFetch, parseResponse)를 재사용한다.
- 이미 구현된 `updateSessionTitle` API 클라이언트 함수를 활용한다. 중복 구현하지 않는다.
- 이미 구현된 새 세션 타이틀 optimistic 반영 로직과 백그라운드 세션 재조회 로직을 활용한다.
- 기존 Neo-Brutalism 디자인 시스템(brutal-shadow, brutal-border, brutal-hover)을 그대로 따른다.
- 화면에 표시되는 모든 텍스트는 영문을 사용한다.
- 오버엔지니어링하지 않는다. 요구사항에 명시되지 않은 기능(타이틀 자동 재생성, 실시간 WebSocket 동기화, 타이틀 검색, 타이틀 히스토리 등)을 추가하지 않는다.
- 세션 타이틀 표시와 편집에 집중한다. 기존 챗봇 기능(메시지 전송, 소스 인용, 세션 삭제 등)을 재정의하지 않는다.
```

---

## 프롬프트 엔지니어링 기법 설명

| 기법 | 적용 위치 | 설명 |
|------|----------|------|
| Role Prompting | `# 역할` | LLM에 시니어 PM + 챗봇 세션 관리 전문가 역할을 부여하여 도메인 전문성 유도 |
| Structured Input | `<api-spec>` 태그 | API 설계서를 명확한 경계로 구분하여 제공 |
| Delta Context | `# 기존 구현 현황` | 이미 구현된 코드를 코드 스니펫으로 명시하여 중복 구현 방지 및 증분 작업 범위 한정 |
| Explicit Output Format | `# 출력 형식` > `## PRD 구조` | 8개 섹션 구조를 번호로 지정하여 누락 방지 |
| Scoped Requirements | `# 기능 요구사항` F1~F3 | 3개 기능으로 범위를 명확히 한정, 각 기능에 사용 API와 검증 규칙을 명시 |
| Constraint Specification | `# 제약 조건` | 오버엔지니어링 방지, 기존 코드 활용, 증분 범위 한정을 명시적으로 선언 |
| Context Anchoring | `# 프로젝트 기본 정보` | 기술 스택, 색상 코드, 디자인 시스템 등 사실 기반 정보를 고정값으로 제공 |
| Chain-of-Reference | `## 타이틀 관련 이미 구현된 부분` | 실제 코드 스니펫 3개를 보여주어 기존 패턴과의 일관성 확보 및 활용 유도 |
| Domain-Specific Best Practices | `# 세션 타이틀 UI/UX 베스트 프랙티스 가이드` | ChatGPT, Copilot, Open WebUI의 실제 패턴 10개 항목을 체계적으로 정리하여 PRD에 반영 유도 |
| Negative Constraint | `# 제약 조건` 마지막 2항목 | 범위 외 기능(WebSocket, 타이틀 검색 등)과 기존 기능 재정의를 명시적으로 차단 |
