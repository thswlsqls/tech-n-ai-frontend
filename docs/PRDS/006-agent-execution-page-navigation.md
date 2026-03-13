# PRD: AI Agent Execution Page + Navigation

**Version**: 1.0
**Created**: 2026-03-13
**Module**: Admin App (`/admin`)

---

## 1. Overview

### Project Information

| Item | Detail |
|------|--------|
| App | Admin App |
| Location | `/admin` (standalone Next.js project) |
| Stack | Next.js 16 (App Router) + React 19 + TypeScript |
| UI Library | Radix UI + CVA (class-variance-authority) |
| Styling | Tailwind CSS v4 + Neo-Brutalism utilities |
| Icons | Lucide React |
| Fonts | Space Grotesk (sans), DM Mono (mono) |
| Design Theme | Neo-Brutalism |
| Markdown Rendering | react-markdown + remark-gfm (installed) |
| API Gateway | `http://localhost:8081` (Next.js rewrites `/api/*` → Gateway proxy) |
| Auth | JWT-based BFF pattern (HttpOnly cookies, ADMIN role). Middleware injects Authorization header. |
| UI Language | English |

### Chatbot vs Agent: Key Differences

| Aspect | Chatbot (User App) | Agent (Admin App) |
|--------|-------------------|-------------------|
| Target User | General users | ADMIN role |
| Input Field | `message` (Max 500 chars) | `goal` (natural language, no length limit) |
| Session ID Field | `conversationId` | `sessionId` |
| Response Type | `ChatResponse` (response, sources) | `AgentExecutionResult` (success, summary, metadata) |
| Response Time | Seconds | 10–60 seconds (LLM + external APIs) |
| Response Content | Plain text | Markdown (tables, code blocks, Mermaid possible) |
| Source Citation | `SourceResponse[]` array | None (included naturally in summary) |
| Session Title Edit | PATCH endpoint available | No endpoint |
| Execution Metadata | None | toolCallCount, analyticsCallCount, executionTimeMs, errors |

### Pre-built Components (Reuse As-Is)

The following API layer is already implemented and must be reused without modification:

- **`types/agent.ts`**: `AgentRunRequest`, `AgentExecutionResult`, `SessionResponse`, `MessageResponse`, `PageData<T>`, `SessionListResponse`, `MessageListResponse`, `SessionListParams`, `MessageListParams`, `ExecutionMeta`
- **`lib/agent-api.ts`**: `runAgent()`, `fetchAgentSessions()`, `fetchAgentSessionDetail()`, `fetchAgentSessionMessages()`, `deleteAgentSession()`
- **`lib/auth-fetch.ts`**: Agent-related error message codes already added (`GOAL_EMPTY`, `AGENT_EXECUTION_ERROR`, `INVALID_SESSION_ID`, `SESSION_FORBIDDEN`, `SESSION_NOT_FOUND`)

---

## 2. API Integration

### Endpoint Summary

| # | Method | Endpoint | API Client Function | Description |
|---|--------|----------|-------------------|-------------|
| 1 | POST | `/api/v1/agent/run` | `runAgent(req)` | Execute Agent |
| 2 | GET | `/api/v1/agent/sessions` | `fetchAgentSessions(params)` | List sessions |
| 3 | GET | `/api/v1/agent/sessions/{sessionId}` | `fetchAgentSessionDetail(id)` | Session detail |
| 4 | GET | `/api/v1/agent/sessions/{sessionId}/messages` | `fetchAgentSessionMessages(id, params)` | Message history |
| 5 | DELETE | `/api/v1/agent/sessions/{sessionId}` | `deleteAgentSession(id)` | Delete session |

### Common Response Format

```
ApiResponse<T> {
  code: string          // "2000" for success
  messageCode: { code: string, text: string }
  message?: string
  data?: T
}
```

Parsed by existing `parseResponse<T>()` and `parseVoidResponse()` in `auth-fetch.ts`.

### API #1: Agent Execution — `POST /api/v1/agent/run`

**Request**: `AgentRunRequest`

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| goal | string | Yes | NotBlank | Execution goal (natural language) |
| sessionId | string | No | - | Session ID (auto-generated via TSID if omitted) |

**Response**: `ApiResponse<AgentExecutionResult>`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | boolean | Yes | Execution success status |
| summary | string | Yes | LLM-generated result summary (may contain Markdown) |
| sessionId | string | Yes | Session ID (reuse for multi-turn) |
| toolCallCount | number | Yes | Number of Tool calls |
| analyticsCallCount | number | Yes | Number of analytics Tool calls |
| executionTimeMs | number | Yes | Execution time in milliseconds |
| errors | string[] | Yes | Error messages (empty array on success) |

**Errors**: 400 (empty goal), 401 (auth failed), 403 (not ADMIN), 500 (execution error)

### API #2: Session List — `GET /api/v1/agent/sessions`

**Query Parameters**:

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| page | number | 1 | Min(1) | Page number |
| size | number | 20 | Min(1), Max(100) | Page size |

**Response**: `ApiResponse<SessionListResponse>` — `SessionListResponse.data` is `PageData<SessionResponse>`

`SessionResponse` fields: `sessionId`, `title` (nullable), `createdAt`, `lastMessageAt` (nullable), `isActive`

### API #3: Session Detail — `GET /api/v1/agent/sessions/{sessionId}`

**Response**: `ApiResponse<SessionResponse>`

**Errors**: 400 (invalid ID format), 403 (access denied), 404 (not found)

### API #4: Message History — `GET /api/v1/agent/sessions/{sessionId}/messages`

**Query Parameters**: Same as session list (`page` default 1, `size` default 50)

**Response**: `ApiResponse<MessageListResponse>` — `MessageListResponse.data` is `PageData<MessageResponse>`

`MessageResponse` fields: `messageId`, `sessionId`, `role` ("USER" | "ASSISTANT"), `content`, `tokenCount?`, `sequenceNumber`, `createdAt`

### API #5: Session Delete — `DELETE /api/v1/agent/sessions/{sessionId}`

**Response**: `ApiResponse<Void>`

**Errors**: 400 (invalid ID format), 403 (access denied), 404 (not found)

---

## 3. Page Structure

### New/Modified Pages

| Page | Route | Type | Description |
|------|-------|------|-------------|
| Agent Execution | `/agent` | New | Session sidebar + chat-style conversation area |
| Dashboard | `/` | Modified | Add "AI Agent" card |
| Header | (component) | Modified | Add "Agent" navigation link |

### `/agent` — Agent Execution Page Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Tech N AI [Admin]    [Accounts] [Agent]   user  [x]│  ← Header (modified)
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  [+ New]     │   ┌──────────────────────────────────────┐   │
│              │   │  USER bubble (right-aligned, blue)   │   │
│  Session 1 ● │   │  "Collect latest AI releases..."     │   │
│  Session 2   │   │                            10:05 AM  │   │
│  Session 3   │   └──────────────────────────────────────┘   │
│              │                                              │
│              │   ┌──────────────────────────────────────┐   │
│              │   │  ASSISTANT bubble (left, gray bg)    │   │
│              │   │  [Markdown rendered summary]         │   │
│              │   │  ┌────────────────────────────────┐  │   │
│              │   │  │ ✓ Success  │ 15 calls │ 12.5s │  │   │  ← Metadata card
│              │   │  │ Errors: none                   │  │   │
│              │   │  └────────────────────────────────┘  │   │
│              │   │                            10:05 AM  │   │
│              │   └──────────────────────────────────────┘   │
│              │                                              │
│  [Load more] │   ┌──────────────────────────────────────┐   │
│              │   │  🔄 Agent is working...              │   │  ← Loading indicator
│              │   │  This may take up to a minute.       │   │
│              │   └──────────────────────────────────────┘   │
│              │                                              │
│              ├──────────────────────────────────────────────┤
│              │  [textarea: Enter a goal for the agent...]  │  ← Input area
│              │                                    [Send ▶] │
└──────────────┴──────────────────────────────────────────────┘
```

### `/agent` — Empty State Wireframe

```
┌──────────────┬──────────────────────────────────────────────┐
│              │                                              │
│  [+ New]     │         🤖                                   │
│              │    Welcome to AI Agent                       │
│  (no sessions│                                              │
│   yet)       │    Give the agent a goal and it will         │
│              │    autonomously collect, search, and          │
│              │    analyze emerging tech data.                │
│              │                                              │
│              │    ┌─────────────────────────────────────┐   │
│              │    │ Collect latest AI releases from     │   │
│              │    │ GitHub                               │   │
│              │    ├─────────────────────────────────────┤   │
│              │    │ Analyze recent trends in AI model   │   │
│              │    │ releases                            │   │
│              │    ├─────────────────────────────────────┤   │
│              │    │ Search for OpenAI updates this      │   │
│              │    │ month                               │   │
│              │    └─────────────────────────────────────┘   │
│              │                                              │
│              ├──────────────────────────────────────────────┤
│              │  [textarea: Enter a goal for the agent...]  │
│              │                                    [Send ▶] │
└──────────────┴──────────────────────────────────────────────┘
```

### `/` — Dashboard Update Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                             │
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────────┐  │
│  │  Account Management    │  │  🤖 AI Agent               │  │
│  │  Manage administrator  │  │  Run AI Agent for data     │  │
│  │  accounts.             │  │  collection, analysis,     │  │
│  │                        │  │  and monitoring.            │  │
│  │  [Go to Accounts →]   │  │  [Go to Agent →]           │  │
│  └────────────────────────┘  └────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Component Specification

### 4.1 Agent Page (`app/agent/page.tsx`)

The main controller component following the same "single stateful controller" pattern as the Chatbot page (`app/src/app/chat/page.tsx`).

**State Variables:**

| State | Type | Purpose |
|-------|------|---------|
| `sessions` | `SessionResponse[]` | Sidebar session list |
| `sessionsPageMeta` | `SessionListResponse \| null` | Pagination cursor for sessions |
| `isLoadingSessions` | `boolean` | Sidebar loading gate |
| `activeSessionId` | `string \| null` | Currently selected session |
| `messages` | `DisplayMessage[]` | Rendered message list |
| `sessionId` | `string \| null` | Current session ID for API calls (null = new session) |
| `isSending` | `boolean` | Blocks double-send; drives loading indicator |
| `isLoadingMessages` | `boolean` | Full-area spinner when switching sessions |
| `isLoadingOlder` | `boolean` | Loading spinner for older messages |
| `messagesCurrentPage` | `number` | Tracks oldest loaded page |
| `hasOlderMessages` | `boolean` | Gate for infinite scroll trigger |
| `deleteSessionId` | `string \| null` | Controls delete confirmation dialog |

**Refs (Race Condition Guards):**

| Ref | Type | Purpose |
|-----|------|---------|
| `loadingSessionRef` | `string \| null` | Guards against stale session responses when rapidly switching sessions |
| `isLoadingOlderRef` | `boolean` | Synchronous guard against duplicate "load older" fetches from rapid scroll events |
| `failedGoalRef` | `Map<string, string>` | Stores original goal text for retry without re-renders |

**`DisplayMessage` Type** (local to agent module):

```typescript
interface DisplayMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  failed?: boolean;
  executionMeta?: ExecutionMeta;  // ASSISTANT messages only
}
```

**Key Flows:**

1. **Auth guard**: `useEffect` watching `{ user, isLoading }` from `useAuth()`. Redirect to `/signin` if unauthenticated. Return `null` while loading.
2. **Session list load**: On mount, call `fetchAgentSessions({ page: 1, size: 20 })`.
3. **Session select**: Set `activeSessionId`, clear messages, call `loadSessionMessages(sessionId)`.
4. **Initial message load**: Two-request strategy (same as Chatbot): fetch page 1 to discover `totalPageNumber`, then fetch last page for newest messages.
5. **Send goal**: See F1 flow below.
6. **New session**: Clear `sessionId` to `null`, clear messages, clear `activeSessionId`.

**F1 — Goal Send Flow:**

```
1. User types goal → clicks Send (or Enter)
2. Client validates: goal.trim() !== "" && !isSending
3. Create optimistic USER DisplayMessage (tempId, goal text)
4. Append to messages[], set isSending = true
5. Call runAgent({ goal, sessionId? })
6. On success:
   a. Update sessionId from response
   b. If new session: set activeSessionId, optimistically add to sessions[], reload sessions in background
   c. Create ASSISTANT DisplayMessage with summary + executionMeta
   d. Append to messages[]
7. On error:
   a. Mark USER message as failed (failedGoalRef.set(tempId, goalText))
   b. Show toast error
8. Finally: set isSending = false
```

### 4.2 Agent Sidebar (`components/agent/agent-sidebar.tsx`)

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `sessions` | `SessionResponse[]` | Session list |
| `activeSessionId` | `string \| null` | Currently active session |
| `isLoading` | `boolean` | Loading state |
| `hasMore` | `boolean` | Whether more sessions exist |
| `onSelectSession` | `(id: string) => void` | Session click handler |
| `onNewSession` | `() => void` | New session button handler |
| `onDeleteSession` | `(id: string) => void` | Delete button handler |
| `onLoadMore` | `() => void` | "Load more" button handler |

**Behavior:**
- Fixed-width sidebar (`w-72`), left side, `border-r-2 border-black`, full height
- "New Session" button at top — Neo-Brutalism style with `Plus` icon
- Scrollable session list, ordered by `lastMessageAt` descending (server-side)
- Active session highlighted with `bg-accent` (#DBEAFE)
- Session title: use `title` if available, fallback to "New Session"
- Delete button (X icon): visible on hover (`opacity-0 group-hover:opacity-100`)
- No title edit functionality (no API endpoint)
- "Load more" button at bottom when `hasMore && !isLoading`
- Timestamp display: relative time using `formatRelativeTime()` utility

**No inline title editing** — unlike the Chatbot sidebar, the Agent API does not have a PATCH title endpoint.

### 4.3 Message Area (`components/agent/agent-message-area.tsx`)

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `messages` | `DisplayMessage[]` | Message list |
| `isSending` | `boolean` | Whether agent is executing |
| `isLoadingMessages` | `boolean` | Full-area loading |
| `isLoadingOlder` | `boolean` | Top loading spinner |
| `hasOlderMessages` | `boolean` | Infinite scroll gate |
| `showEmptyState` | `boolean` | Whether to show empty state |
| `onGoalClick` | `(goal: string) => void` | Empty state example click |
| `onRetry` | `(messageId: string) => void` | Failed message retry |
| `onLoadOlder` | `() => void` | Load older messages trigger |

**Behavior:**
- Scrollable container with `overflow-y-auto`, `overflowAnchor: "none"`
- **Infinite scroll up**: `onScroll` — when `scrollTop === 0 && hasOlderMessages && !isLoadingOlder`, call `onLoadOlder()`
- **Scroll position preservation**: `useLayoutEffect` — when `isLoadingOlder` transitions to false, restore `scrollTop = newScrollHeight - prevScrollHeight`
- **Auto-scroll**: when `messages.length` changes and user is near bottom (`isNearBottomRef`), smooth scroll to bottom
- **"Scroll to bottom" button**: floating `ArrowDown` button visible when user is scrolled up (not near bottom)
- Loading states:
  - `isLoadingMessages`: centered `Loader2 size-8` spinner replacing entire area
  - `isLoadingOlder`: small `Loader2 size-5` at top of message list

### 4.4 Message Bubble (`components/agent/agent-message-bubble.tsx`)

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `message` | `DisplayMessage` | Message data |
| `onRetry` | `(id: string) => void` | Retry handler (USER failed messages) |

**USER Messages:**
- Right-aligned (`justify-end`), `bg-[#3B82F6]` with white text
- Plain text rendering (`whitespace-pre-wrap break-words`)
- Failed state: `AlertCircle` icon + "Failed to send" text + "Retry" button
- Timestamp in `DM Mono` font

**ASSISTANT Messages:**
- Left-aligned (`justify-start`), `bg-[#F5F5F5]` (secondary) background
- Content rendered via `react-markdown` + `remark-gfm` for Markdown support
- `executionMeta` card displayed below the message content (if present)
- Timestamp in `DM Mono` font
- **No `rehype-raw`** — raw HTML rendering is forbidden for security

**Markdown Rendering Configuration:**

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      if (match) {
        // Syntax-highlighted code block
        return (
          <pre className="brutal-border bg-white p-3 overflow-x-auto text-sm">
            <code className={className} {...props}>{children}</code>
          </pre>
        );
      }
      // Inline code
      return <code className="bg-gray-200 px-1 py-0.5 text-sm font-mono" {...props}>{children}</code>;
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto">
          <table className="brutal-border w-full text-sm">{children}</table>
        </div>
      );
    },
    th({ children }) {
      return <th className="brutal-border bg-[#DBEAFE] px-3 py-2 text-left font-bold">{children}</th>;
    },
    td({ children }) {
      return <td className="border border-black px-3 py-2">{children}</td>;
    },
  }}
>
  {message.content}
</ReactMarkdown>
```

### 4.5 Execution Metadata Card (`components/agent/agent-execution-meta.tsx`)

Displayed below the ASSISTANT message content. Shows Agent execution statistics.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `meta` | `ExecutionMeta` | Execution metadata |

**Layout:**

```
┌──────────────────────────────────────────────────┐
│  ✓ Success          15 tool calls      12.5s     │  ← Single row summary
│  (or ✗ Failed)      (analyticsCallCount + tool)  │
├──────────────────────────────────────────────────┤
│  ⚠ Error: Rate limit exceeded                   │  ← Only if errors[] is non-empty
│  ⚠ Error: Timeout on scrape                     │
└──────────────────────────────────────────────────┘
```

**Behavior:**
- Container: `brutal-border bg-white p-3 mt-2`
- Success badge: `Badge variant="success"` with "Success" text
- Failed badge: `Badge variant="destructive"` with "Failed" text
- Tool calls: `toolCallCount + analyticsCallCount` displayed as "N tool calls"
- Execution time: `executionTimeMs` converted to seconds (`(ms / 1000).toFixed(1)s`)
- Errors section: only rendered when `errors.length > 0`. Each error in `text-sm text-[#EF4444]` with `AlertTriangle` icon

### 4.6 Agent Loading Indicator (`components/agent/agent-loading-indicator.tsx`)

Displayed at the bottom of the message list while `isSending` is true.

**Design:** Distinguished from the Chatbot's typing indicator (3 bouncing dots) — Agent execution takes 10–60 seconds and requires more reassuring feedback.

```
┌──────────────────────────────────────────────────┐
│  🔄 Agent is working...                          │
│  This may take up to a minute.                   │
└──────────────────────────────────────────────────┘
```

- Container: left-aligned like ASSISTANT bubble, `bg-[#F5F5F5]`
- Spinner: `Loader2` with `animate-spin`, `text-[#3B82F6]`
- Primary text: "Agent is working..." (bold)
- Secondary text: "This may take up to a minute." (text-sm, muted)
- `aria-label="Agent is working"` and `aria-live="polite"` on container

### 4.7 Goal Input (`components/agent/agent-input.tsx`)

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `onSend` | `(goal: string) => void` | Goal submit handler |
| `disabled` | `boolean` | Disable input entirely |
| `isSending` | `boolean` | Agent is executing |

**Behavior:**
- `textarea` (not input) — goals can be multi-line and have no length limit
- Auto-resize: set `height: auto` then `height: scrollHeight + "px"`, max-height 200px
- **Enter** to send, **Shift+Enter** for newline
- `canSend` gate: `goal.trim() !== "" && !disabled && !isSending`
- Send button: `SendHorizontal` icon normally, `Loader2 animate-spin` while sending
- Both textarea and button disabled while `isSending`
- Placeholder: "Enter a goal for the agent..."
- Container: bottom-fixed, `border-t-2 border-black bg-white px-4 py-3`
- No character counter (no length limit for goal)

### 4.8 Delete Session Dialog (`components/agent/agent-delete-dialog.tsx`)

Follows the existing `DeleteDialog` pattern from accounts.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | Visibility toggle |
| `sessionId` | `string \| null` | Session to delete |
| `onDeleted` | `(sessionId: string) => void` | Success callback |

**Behavior:**
- Uses `AlertDialog` (Radix) — requires explicit Cancel or Confirm action
- Title: "Delete Session"
- Description: "Are you sure you want to delete this session? This action cannot be undone."
- Cancel button: `AlertDialogCancel` (white bg, brutal style)
- Delete button: custom `<button>` with red bg, loading spinner while deleting
- On success: call `onDeleted(sessionId)`, show success toast
- On error: show error toast, close dialog
- API: `deleteAgentSession(sessionId)`

### 4.9 Empty State (`components/agent/agent-empty-state.tsx`)

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `onGoalClick` | `(goal: string) => void` | Example goal click handler |

**Behavior:**
- Shown when `!activeSessionId && !sessionId && messages.length === 0`
- Centered content:
  - `Bot` icon (from lucide-react) in a bordered box with blue accent
  - Title: "Welcome to AI Agent" (text-xl font-bold)
  - Subtitle: "Give the agent a goal and it will autonomously collect, search, and analyze emerging tech data."
  - Three example goal buttons:
    1. "Collect latest AI releases from GitHub"
    2. "Analyze recent trends in AI model releases"
    3. "Search for OpenAI updates this month"
- Each button: `brutal-border brutal-shadow-sm brutal-hover bg-white px-4 py-3 text-left text-sm font-bold w-full`
- Clicking an example button calls `onGoalClick(goal)` which pipes directly into the send handler

### 4.10 Header Navigation Update (`components/auth/header.tsx`)

Add "Agent" link in the `<nav>` element, after the existing "Accounts" link.

```tsx
<Link
  href="/agent"
  className={`text-sm font-bold transition-colors hover:text-[#3B82F6] ${
    pathname === "/agent" ? "text-[#3B82F6]" : ""
  }`}
>
  Agent
</Link>
```

Active state: `text-[#3B82F6]` when `pathname === "/agent"`.

### 4.11 Dashboard Card Update (`app/page.tsx`)

Add "AI Agent" card below "Account Management". Switch to a 2-column grid layout.

```tsx
<div className="grid gap-6 md:grid-cols-2">
  {/* Existing Account Management card */}
  <div className="bg-white brutal-border brutal-shadow p-6">...</div>

  {/* New AI Agent card */}
  <div className="bg-white brutal-border brutal-shadow p-6">
    <div className="flex items-center gap-2 mb-2">
      <Bot className="size-5 text-[#3B82F6]" />
      <h2 className="text-lg font-bold">AI Agent</h2>
    </div>
    <p className="mb-4 text-sm text-gray-500">
      Run AI Agent for data collection, analysis, and monitoring.
    </p>
    <Link
      href="/agent"
      className="brutal-border brutal-shadow-sm brutal-hover inline-flex items-center gap-2 bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white"
    >
      Go to Agent
      <ArrowRight className="size-4" />
    </Link>
  </div>
</div>
```

---

## 5. Design Guide

### Neo-Brutalism Consistency

All new components must follow the established design system exactly:

| Element | Class / Style |
|---------|--------------|
| Card borders | `brutal-border` (2px solid #000) |
| Card shadows | `brutal-shadow` (4px 4px), `brutal-shadow-sm` (2px 2px) |
| Interactive elements | `brutal-hover` (translate + shadow collapse) |
| Border radius | 0 everywhere (--radius: 0rem) |
| Primary color | `#3B82F6` (blue) |
| Accent background | `#DBEAFE` (light blue) |
| Page background | `#F5F5F5` |
| Card/bubble background | `#FFFFFF` or `#F5F5F5` |
| Destructive color | `#EF4444` (red) |
| All borders/shadows | `#000000` |
| Loading spinners | `Loader2 className="animate-spin"` from lucide-react |
| Fonts | Space Grotesk (body text), DM Mono (timestamps, IDs) |

### Markdown Content Styling

ASSISTANT message bubbles contain Markdown. Apply Neo-Brutalism styling to rendered elements:

| Element | Style |
|---------|-------|
| Tables | `brutal-border`, `th` with `bg-[#DBEAFE]` header, `td` with `border border-black` |
| Code blocks | `brutal-border bg-white p-3 overflow-x-auto text-sm font-mono` |
| Inline code | `bg-gray-200 px-1 py-0.5 text-sm font-mono` |
| Lists | Default browser styling with proper indentation |
| Headers (h1-h6) | Bold, with appropriate size hierarchy |
| Links | `text-[#3B82F6] underline` |
| Blockquotes | `border-l-4 border-[#3B82F6] pl-4 italic text-gray-600` |

### Metadata Card Layout

- Horizontal layout: success badge | tool call count | execution time in a single row
- Container: `brutal-border bg-white p-3 mt-2`
- Badge: existing `Badge` component with `success` or `destructive` variant
- Errors: separate row below, each with `AlertTriangle` icon in red
- Monospace font for numeric values (execution time, call counts)

### Message Layout

| Aspect | USER | ASSISTANT |
|--------|------|-----------|
| Alignment | Right (`justify-end`) | Left (`justify-start`) |
| Max width | 70% of container | 85% of container (wider for Markdown content) |
| Background | `bg-[#3B82F6]` | `bg-[#F5F5F5]` |
| Text color | White | Black |
| Border | `brutal-border` | `brutal-border` |
| Shadow | `brutal-shadow-sm` | `brutal-shadow-sm` |
| Content | Plain text | Markdown rendered |

---

## 6. Security

### S1. Markdown XSS Prevention
- Use `react-markdown`'s built-in sanitization (default allowlist)
- **DO NOT use `rehype-raw`** — raw HTML insertion is blocked
- Mermaid code blocks may render in a future iteration; for now, display as regular code blocks
- All Markdown content originates from LLM (untrusted input) — treat accordingly

### S2. Input Validation
- Client-side: prevent empty goal submission (`goal.trim() !== ""`)
- Server-side: `NotBlank` validation on `goal` field (returns 400)
- Dual validation ensures robustness

### S3. JWT Token Management
- Reuse existing `authFetch` infrastructure (BFF pattern)
- Access tokens stored in HttpOnly cookies — never exposed to client JavaScript
- Middleware injects `Authorization` header on all `/api/v1/*` requests
- 401 handling: automatic token refresh via singleton pattern, retry once, redirect to `/signin` on failure
- ADMIN role verification is performed by the API Gateway

### S4. Session Access Control
- Each session is owned by its creator (user ID from JWT)
- Accessing another user's session returns 403
- Handle 403 errors with toast: "You don't have permission to access this session."

### S5. Duplicate Submission Prevention
- `isSending` state disables both the textarea and Send button during execution
- `canSend` gate checks `!isSending` before allowing submission
- Prevents accidental duplicate Agent executions (which are expensive, 10–60s each)

---

## 7. Technical Implementation Details

### Package Dependencies

Already installed (no new packages needed):
- `react-markdown` — Markdown rendering
- `remark-gfm` — GitHub Flavored Markdown support (tables, strikethrough, etc.)

### File Structure

```
admin/src/
├── app/
│   ├── page.tsx                    ← MODIFY: Add Agent card, grid layout
│   └── agent/
│       └── page.tsx                ← NEW: Agent execution page controller
├── components/
│   ├── auth/
│   │   └── header.tsx              ← MODIFY: Add "Agent" nav link
│   └── agent/
│       ├── agent-sidebar.tsx       ← NEW: Session sidebar
│       ├── agent-message-area.tsx  ← NEW: Scrollable message area
│       ├── agent-message-bubble.tsx ← NEW: USER/ASSISTANT message display
│       ├── agent-execution-meta.tsx ← NEW: Execution metadata card
│       ├── agent-loading-indicator.tsx ← NEW: Long-running execution indicator
│       ├── agent-input.tsx         ← NEW: Goal textarea input
│       ├── agent-empty-state.tsx   ← NEW: Welcome + example goals
│       └── agent-delete-dialog.tsx ← NEW: Session delete confirmation
├── lib/
│   ├── agent-api.ts                ← EXISTS: No changes
│   └── auth-fetch.ts               ← EXISTS: No changes
└── types/
    └── agent.ts                    ← EXISTS: No changes
```

### mermaid.initialize() — Future Consideration

Mermaid chart rendering is **not in scope** for this PRD. Mermaid code blocks (`\`\`\`mermaid`) will be displayed as regular code blocks. A separate PRD will address Mermaid rendering support.

### Chatbot Implementation Patterns to Reuse

The following patterns from the Chatbot page should be adapted for the Agent page:

| Pattern | Chatbot Implementation | Agent Adaptation |
|---------|----------------------|-----------------|
| Race condition guard | `loadingSessionRef` — discard stale session responses | Same pattern, same ref usage |
| Infinite scroll up | `isLoadingOlderRef` + `useLayoutEffect` scroll restoration | Same pattern, identical scroll mechanics |
| Two-request initial load | Fetch page 1 → discover total → fetch last page | Same strategy for newest-first message display |
| Optimistic UI (new session) | Add session to sidebar immediately, reconcile in background | Same: add after first Agent response, reload sessions |
| Failed message retry | `failedMessageRef` Map storing original text | Adapted as `failedGoalRef` for goal text |
| Auto-scroll gating | `isNearBottomRef` (100px threshold) | Same: no auto-scroll when user is reading history |
| Auth guard | `useEffect` + `useAuth()` + `router.replace("/signin")` | Identical pattern |
| Delete flow | `AlertDialog` + API call + remove from state | Identical pattern using `deleteAgentSession()` |

### Differences from Chatbot

| Aspect | Chatbot | Agent |
|--------|---------|-------|
| Response handling | Direct `ChatResponse` with `response` field | `AgentExecutionResult` with `summary` + metadata |
| ASSISTANT display | Plain text (`whitespace-pre-wrap`) | Markdown rendering (`react-markdown` + `remark-gfm`) |
| Metadata card | None | `ExecutionMeta` card below each ASSISTANT message |
| Loading indicator | 3 bouncing dots + "AI is thinking..." | Spinner + "Agent is working... This may take up to a minute." |
| Input | Max 500 chars, character counter | No length limit, no counter |
| Title editing | Inline edit in sidebar | Not available (no API endpoint) |
| Source citations | `SourceResponse[]` below message | None |

---

## 8. Accessibility

### ARIA Attributes

| Component | Attribute | Value |
|-----------|-----------|-------|
| Message area container | `role` | `"log"` |
| Message area container | `aria-label` | `"Agent conversation"` |
| Loading indicator | `aria-live` | `"polite"` |
| Loading indicator | `aria-label` | `"Agent is working"` |
| Send button | `aria-label` | `"Send goal"` |
| New Session button | `aria-label` | `"Start new session"` |
| Delete button (sidebar) | `aria-label` | `"Delete session"` |
| Session list | `role` | `"list"` |
| Each session item | `role` | `"listitem"` |

### Keyboard Navigation

| Component | Key | Action |
|-----------|-----|--------|
| Goal textarea | `Enter` | Send goal |
| Goal textarea | `Shift+Enter` | Insert newline |
| Delete dialog | `Escape` | Cancel delete |
| Sidebar session | `Enter` | Select session |
| Example goal button | `Enter` / `Space` | Send example goal |

### Loading States

- All loading spinners have `aria-hidden="true"` with corresponding `aria-label` on parent
- Button disabled states use both `disabled` and `aria-disabled` attributes
- Full-area loading replaces content entirely (no content under overlay)

---

## 9. Scope

### Included

- F1: Agent execution (goal submission, response display)
- F2: Execution result display with Markdown rendering and metadata card
- F3: Session sidebar (list, select, delete, load more, new session)
- F4: Message history with infinite scroll up (newest-first initial load)
- F5: Session deletion with confirmation dialog
- F6: New session creation
- F7: Dashboard update (AI Agent card)
- F8: Header navigation update (Agent link)
- F9: Empty state with example goals
- Race condition guards (stale session response, duplicate scroll fetch)
- Auto-scroll with "near bottom" gating
- Failed goal retry
- Full accessibility support

### Excluded

- **Streaming / SSE / WebSocket / Polling**: Agent responses are synchronous (non-streaming)
- **Session title editing**: No Agent API endpoint for PATCH title
- **Mermaid chart rendering**: Separate PRD (007). Mermaid blocks displayed as code blocks for now
- **Real-time progress updates**: No intermediate status during Agent execution
- **Agent configuration UI**: No settings/preferences for Agent behavior
- **Dark mode**: Not supported in the Admin App
- **Tool execution log UI**: Tool details are not exposed via API
- **Export functionality**: No PDF/image export of conversations
- **Message search**: No search within conversations
- **Keyboard shortcuts beyond Enter/Shift+Enter**: No Cmd+K, etc.
- **Stop/cancel mechanism**: Once submitted, Agent execution cannot be aborted
- **Syntax highlighting library**: Code blocks are styled but not language-highlighted (consider adding in a future iteration)
