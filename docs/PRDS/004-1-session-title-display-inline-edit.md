# PRD: Session Title — Display, Async Sync, Inline Edit

**작성일**: 2026-02-15
**버전**: v1
**기반 프롬프트**: `docs/prompts/004-1-session-title-prd-generation-prompt.md`
**API 스펙 문서**: `docs/API-specifications/api-chatbot/3-session-title-generation-design.md`

---

## 1. 개요

기존 챗봇 UI(`/chat`)에 세션 타이틀 표시 개선 및 인라인 편집 기능을 추가하는 **증분(incremental) 작업**이다. 챗봇 메시지 전송, 세션 목록, 대화 내역 로드, 세션 삭제 등 기존 기능은 이미 구현 완료 상태이며, 이번 PRD는 **세션 타이틀 표시와 편집에만 집중**한다.

### 배경

현재 사이드바에서 세션 타이틀이 `null`인 경우 "Untitled"로 표시되지만, 서버에서 비동기로 자동 생성되는 타이틀의 특성을 고려한 UX가 부족하고, 사용자가 타이틀을 수동 변경할 수 있는 UI가 없다.

### 목표

1. 사이드바 세션 항목에 타이틀을 개선된 UX로 표시 (null 폴백, 말줄임, 호버 전체 텍스트)
2. 새 세션 생성 후 비동기 생성된 타이틀을 자연스럽게 동기화
3. 사용자가 세션 타이틀을 인라인으로 편집 가능

---

## 2. API 연동

### 2.1 사용 API 목록

| # | Method | Endpoint | 용도 |
|---|--------|----------|------|
| 1 | POST | `/api/v1/chatbot` | 채팅 전송 (기존) — `ChatResponse.title` 필드 활용 |
| 2 | GET | `/api/v1/chatbot/sessions` | 세션 목록 조회 (기존) — 비동기 생성 타이틀 동기화 |
| 3 | **PATCH** | **`/api/v1/chatbot/sessions/{sessionId}/title`** | **세션 타이틀 수동 변경 (신규 활용)** |

### 2.2 PATCH /sessions/{sessionId}/title 상세

**이미 구현된 API 클라이언트 함수** (`lib/chatbot-api.ts`):

```typescript
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

**Request Body**

| 필드 | 타입 | 필수 | 검증 | 설명 |
|------|------|------|------|------|
| title | String | O | NotBlank, Max(200) | 새 세션 타이틀 (최대 200자) |

**Response** (200 OK): `SessionResponse`

```json
{
  "sessionId": "sess_abc123def456",
  "title": "AI Trends Discussion",
  "createdAt": "2025-01-20T10:00:00",
  "lastMessageAt": "2025-01-20T14:30:00",
  "isActive": true
}
```

**Errors**

| HTTP 상태 | 에러 코드 | 메시지 (`auth-fetch.ts` 매핑) | 상황 |
|----------|---------|------|------|
| 400 | 4000 | "Invalid request. Please check your input." | 빈 타이틀, 200자 초과 |
| 403 | 4030 | "You don't have permission to access this session." (SESSION_FORBIDDEN) | 다른 사용자의 세션 |
| 404 | 4040 | "Session not found." (SESSION_NOT_FOUND) | 존재하지 않는 세션 |

### 2.3 ChatResponse.title 활용

서버에서 비동기로 타이틀을 생성하므로:
- **새 세션 첫 메시지 응답**: `ChatResponse.title`은 `null` (비동기 생성 대기 중)
- **기존 세션 메시지 응답**: `ChatResponse.title`은 `null` (서버에서 조회하지 않음)
- 타이틀 획득 경로: `GET /sessions` 재조회 (이미 구현된 `loadSessions()`)

---

## 3. 컴포넌트 변경 상세

### 3.1 변경 대상 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `components/chatbot/chat-sidebar.tsx` | 타이틀 표시 개선 (폴백 "New Chat", italic 스타일, title 속성), 인라인 편집 UI (Pencil 아이콘, input 전환, 키보드 핸들링) |
| `app/chat/page.tsx` | 타이틀 편집 핸들러 추가 (`handleEditTitle`), `onEditTitle` prop을 사이드바에 전달 |

### 3.2 사이드바 세션 항목 — 타이틀 표시 개선

**현재 구현** (`chat-sidebar.tsx:88-89`):

```tsx
<p className="text-sm font-bold truncate">
  {session.title || "Untitled"}
</p>
```

**변경 후**:

```
┌─────────────────────────────────────┐
│ [Title or "New Chat"]     [✏️] [✕] │
│ 5 min ago                           │
└─────────────────────────────────────┘
```

**표시 규칙**:

| 상태 | 표시 텍스트 | 스타일 |
|------|-----------|--------|
| 타이틀 있음 | `session.title` | `text-sm font-bold truncate` |
| 타이틀 null | `"New Chat"` | `text-sm font-bold truncate italic text-muted-foreground` |

- 폴백 텍스트를 "Untitled"에서 **"New Chat"**으로 변경 (업계 표준: ChatGPT, Copilot)
- null 타이틀은 `italic` + `text-muted-foreground`로 시각적 구분
- 긴 타이틀: `truncate` 클래스 (기존)로 한 줄 말줄임 처리
- 호버 시 전체 텍스트: `<p>` 태그에 `title={session.title || "New Chat"}` 속성 추가

### 3.3 사이드바 세션 항목 — 인라인 편집

#### 3.3.1 편집 진입

- 세션 항목 hover 시 **Pencil 아이콘**을 Delete(X) 아이콘 왼쪽에 표시
- 기존 Delete 버튼과 동일한 `opacity-0 group-hover:opacity-100` 패턴 사용
- Pencil 아이콘 클릭 시 편집 모드 진입 (`e.stopPropagation()` 필수)

```
Normal:    [AI Trends Discussion          ] [✏️] [✕]
                                            ↑ hover시만 표시

Editing:   [AI Trends Discussion___________] [✓] [✕]
           ↑ input으로 전환                   ↑ 저장  ↑ 취소
```

#### 3.3.2 편집 모드 UI

편집 모드 진입 시 타이틀 텍스트가 `<input>` 요소로 교체:

- `<input type="text">` — 기존 타이틀이 pre-fill
- Auto-focus on mount (`autoFocus` 또는 `useRef` + `focus()`)
- 스타일: `text-sm font-bold w-full bg-white brutal-border px-1 py-0 outline-none`
- `maxLength={200}` — HTML 레벨 200자 제한

#### 3.3.3 편집 모드 액션 버튼

편집 모드에서는 hover 아이콘이 변경:

| 위치 | Normal 모드 | Edit 모드 |
|------|------------|-----------|
| 왼쪽 버튼 | Pencil (편집 진입) | Check (저장) |
| 오른쪽 버튼 | X (삭제) | X (취소) |

- Check 아이콘: Lucide `Check` (size-4)
- X 아이콘: 편집 모드에서는 취소 동작 (삭제 아님)
- 편집 모드에서는 아이콘이 항상 표시 (opacity-100 고정)

#### 3.3.4 키보드 인터랙션

| 키 | 동작 |
|---|------|
| `Enter` | 저장 (빈 값이면 무시) |
| `Escape` | 취소 (이전 타이틀로 복원) |

- `input`에 `onKeyDown` 핸들러로 처리
- `onBlur` 이벤트: 취소 처리 (포커스 이탈 시 편집 종료, 저장하지 않음). 단, Check 버튼 클릭 시 blur가 먼저 발생하므로 `onMouseDown` + `e.preventDefault()`로 blur를 방지

#### 3.3.5 Optimistic UI

저장 시 동작 순서:

```
1. 사용자가 Enter 또는 Check 클릭
2. 클라이언트 입력 검증 (빈 값 체크)
3. 편집 모드 종료
4. UI 즉시 반영: sessions 배열에서 해당 세션 title 업데이트
5. API 호출: updateSessionTitle(sessionId, newTitle)
6-a. 성공: 서버 응답의 SessionResponse로 세션 정보 갱신
6-b. 실패: 이전 title로 롤백 + 에러 토스트
```

### 3.4 ChatSidebar Props 변경

**추가 prop**:

```typescript
interface Props {
  // ... 기존 props ...
  onEditTitle: (sessionId: string, newTitle: string) => void;  // NEW
}
```

### 3.5 ChatSidebar 내부 편집 상태

사이드바 컴포넌트 내부에서 관리하는 로컬 상태:

```typescript
const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
const [editingTitle, setEditingTitle] = useState("");
```

- `editingSessionId`: 현재 편집 중인 세션 ID (null이면 편집 모드 아님)
- `editingTitle`: 편집 중인 타이틀 텍스트
- 한 번에 하나의 세션만 편집 가능

---

## 4. 상태 관리

### 4.1 편집 상태 흐름

```
[Normal] → Pencil 클릭 → [Editing]
  ↑                         │
  ├── Enter/Check 클릭 ─────┘ → onEditTitle(sessionId, newTitle) 호출
  ├── Escape/X/Blur ────────┘ → 편집 취소
```

### 4.2 Optimistic UI 롤백 로직 (page.tsx)

```typescript
const handleEditTitle = useCallback(
  async (sessionId: string, newTitle: string) => {
    // 1. 이전 타이틀 저장 (롤백용)
    const prevTitle = sessions.find(s => s.sessionId === sessionId)?.title;

    // 2. Optimistic: 즉시 UI 반영
    setSessions(prev =>
      prev.map(s =>
        s.sessionId === sessionId ? { ...s, title: newTitle } : s
      )
    );

    try {
      // 3. API 호출
      await updateSessionTitle(sessionId, newTitle);
    } catch (err) {
      // 4. 실패 시 롤백
      setSessions(prev =>
        prev.map(s =>
          s.sessionId === sessionId ? { ...s, title: prevTitle } : s
        )
      );
      // 5. 에러 토스트
      if (err instanceof AuthError) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to update title. Please try again.", "error");
      }
    }
  },
  [sessions, showToast]
);
```

### 4.3 비동기 타이틀 동기화

이미 구현된 흐름을 그대로 활용:

```
1. 새 세션 생성 → ChatResponse.title = null
2. Optimistic 세션 추가: { title: null } → 사이드바에 "New Chat" 표시
3. loadSessions() 백그라운드 호출 → 서버에서 비동기 생성된 title 포함된 목록 반환
4. setSessions(data.data.list) → "New Chat" → 실제 타이틀로 자연스럽게 전환
```

추가 변경 없이 기존 로직으로 동기화된다.

---

## 5. 디자인 가이드

### 5.1 폴백 텍스트 스타일 ("New Chat")

```tsx
<p
  className={`text-sm font-bold truncate ${
    !session.title ? "italic text-muted-foreground" : ""
  }`}
  title={session.title || "New Chat"}
>
  {session.title || "New Chat"}
</p>
```

- `italic`: 폴백임을 시각적으로 구분
- `text-muted-foreground`: 실제 타이틀보다 낮은 시각적 위계

### 5.2 Pencil 아이콘 스타일

```tsx
<button
  onClick={(e) => { e.stopPropagation(); startEditing(session); }}
  aria-label="Edit conversation title"
  className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-all shrink-0"
>
  <Pencil className="size-3.5" />
</button>
```

- Delete 버튼과 동일한 hover visibility 패턴
- hover 시 `text-primary` (blue) — Delete의 `text-destructive` (red)와 구분
- `size-3.5`: Delete(size-4)보다 약간 작게 — 보조 액션 위계 반영

### 5.3 인라인 Input 스타일

```tsx
<input
  type="text"
  value={editingTitle}
  onChange={(e) => setEditingTitle(e.target.value)}
  maxLength={200}
  autoFocus
  className="text-sm font-bold w-full bg-white border-2 border-black px-1 py-0 outline-none"
/>
```

- `border-2 border-black`: Neo-Brutalism의 `brutal-border` 동일 스타일
- `bg-white`: 편집 영역 명확히 구분
- `px-1 py-0`: 기존 타이틀 텍스트와 높이 일치
- `outline-none`: 기본 포커스 링 제거 (border가 포커스 표시 역할)

### 5.4 편집 모드 액션 버튼

```tsx
{/* Save button */}
<button
  onMouseDown={(e) => e.preventDefault()} // blur 방지
  onClick={(e) => { e.stopPropagation(); saveEdit(); }}
  aria-label="Save title"
  className="p-1 hover:text-primary transition-all shrink-0"
>
  <Check className="size-4" />
</button>

{/* Cancel button */}
<button
  onMouseDown={(e) => e.preventDefault()} // blur 방지
  onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
  aria-label="Cancel editing"
  className="p-1 hover:text-destructive transition-all shrink-0"
>
  <X className="size-4" />
</button>
```

- 편집 모드에서는 아이콘이 항상 표시 (opacity-100 고정, group-hover 불필요)
- Save: `hover:text-primary` (blue)
- Cancel: `hover:text-destructive` (red)

---

## 6. 에러 처리

### 6.1 API 에러별 사용자 피드백

| 에러 코드 | AuthError.message | 토스트 표시 |
|---------|-------------------|------------|
| 400 (4000) | "Invalid request. Please check your input." | error 토스트 |
| 403 (SESSION_FORBIDDEN) | "You don't have permission to access this session." | error 토스트 |
| 404 (SESSION_NOT_FOUND) | "Session not found." | error 토스트 |
| 네트워크 오류 | (AuthError 아님) | "Failed to update title. Please try again." |

- 모든 에러에서 Optimistic UI 롤백 (이전 타이틀 복원)
- 기존 `auth-fetch.ts`의 `getErrorMessage()` 매핑을 그대로 활용

### 6.2 클라이언트 입력 검증

| 검증 | 동작 |
|------|------|
| 빈 문자열 (trim 후) | 저장하지 않음, 편집 모드 유지 또는 취소 |
| 200자 초과 | `maxLength={200}`으로 HTML 레벨 차단 |
| 이전 타이틀과 동일 | API 호출 생략, 편집 모드 종료 |

---

## 7. 접근성

### 7.1 ARIA 속성

| 요소 | 속성 | 값 |
|------|------|---|
| Pencil 버튼 | `aria-label` | `"Edit conversation title"` |
| Save 버튼 | `aria-label` | `"Save title"` |
| Cancel 버튼 | `aria-label` | `"Cancel editing"` |
| 인라인 input | `aria-label` | `"Edit session title"` |
| 세션 항목 | `aria-label` | `"{title}, {relativeTime}"` (기존, 폴백 텍스트 반영) |

### 7.2 키보드 네비게이션

- 세션 항목: `Tab` 이동, `Enter`로 세션 선택 (기존)
- Pencil 버튼: `Tab`으로 포커스 이동 가능, `Enter`/`Space`로 편집 모드 진입
- 인라인 input: 편집 모드 진입 시 auto-focus, `Enter`로 저장, `Escape`로 취소
- Save/Cancel 버튼: `Tab`으로 이동, `Enter`/`Space`로 실행

---

## 8. 범위 제한

### 포함

- 사이드바 세션 타이틀 표시 개선 (폴백 "New Chat", italic 구분, 말줄임, 호버 전체 텍스트)
- 비동기 생성 타이틀 동기화 (기존 `loadSessions()` 활용)
- 세션 타이틀 인라인 편집 (Pencil 아이콘, input 전환, Enter/Escape, Optimistic UI)
- 기존 `updateSessionTitle` API 클라이언트 활용

### 미포함

- 타이틀 자동 재생성 (기존 세션의 타이틀 재생성 트리거)
- 실시간 WebSocket/SSE 동기화 (폴링이나 WebSocket으로 타이틀 변경 감지)
- 타이틀 검색/필터 (사이드바에서 타이틀 기반 세션 검색)
- 타이틀 변경 히스토리/undo
- 채팅 영역 헤더에 타이틀 표시
- 기존 챗봇 기능(메시지 전송, 소스 인용, 세션 삭제) 변경

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-02-15
