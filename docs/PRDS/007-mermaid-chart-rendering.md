# PRD: Mermaid Chart Rendering in Agent Messages

**Version**: 1.0
**Created**: 2026-03-13
**Module**: Admin App (`/admin`)

---

## 1. Overview

### Purpose

Agent API의 `AgentExecutionResult.summary` 필드는 LLM이 생성한 Markdown 텍스트로, Mermaid 코드 블록(` ```mermaid `)을 포함할 수 있다. 현재 Admin App은 react-markdown + remark-gfm으로 일반 Markdown을 렌더링하지만 Mermaid 코드 블록은 일반 코드로 표시된다. 이 PRD는 Mermaid 코드 블록을 감지하여 시각적 SVG 차트로 렌더링하는 기능을 정의한다.

### Project Information

| Item | Detail |
|------|--------|
| App | Admin App |
| Location | `/admin` (standalone Next.js project) |
| Stack | Next.js 16 (App Router) + React 19 + TypeScript |
| Markdown Rendering | react-markdown v10.1.0 + remark-gfm v4.0.1 (installed) |
| Mermaid Library | `mermaid` npm package (to be installed) |
| Design Theme | Neo-Brutalism |
| UI Language | English |

### Dependencies

| Package | Status | Purpose |
|---------|--------|---------|
| `react-markdown` | Installed (v10.1.0) | Markdown rendering |
| `remark-gfm` | Installed (v4.0.1) | GitHub-flavored markdown support |
| `mermaid` | **To install** | Mermaid diagram SVG rendering |

---

## 2. Architecture

### Component Hierarchy

```
AgentMessageBubble
└── <ReactMarkdown>  (remarkPlugins={[remarkGfm]})
    └── components.code  (custom override)
        ├── language === "mermaid"  →  <MermaidBlock value={...} />
        ├── other language          →  <pre><code>...</code></pre>  (existing)
        └── inline code             →  <code>...</code>  (existing)
```

### Data Flow

```
summary (string)
  → ReactMarkdown parses Markdown AST
    → encounters ```mermaid code block
      → components.code detects className "language-mermaid"
        → renders <MermaidBlock value={mermaidCode} />
          → mermaid.render(uniqueId, mermaidCode)
            → returns sanitized SVG string
              → SVG inserted into DOM via dangerouslySetInnerHTML
```

### Integration Point

`agent-message-bubble.tsx`의 기존 ReactMarkdown `components.code` override에서 `language-mermaid` 분기를 추가한다. 새로운 `MermaidBlock` 컴포넌트는 `next/dynamic`으로 lazy import하여 SSR을 건너뛴다.

---

## 3. Component Details

### 3.1 MermaidBlock Component

**File**: `admin/src/components/agent/mermaid-block.tsx`

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Raw Mermaid code text (trimmed) |

**State Management**:

| State | Type | Initial | Description |
|-------|------|---------|-------------|
| `svg` | `string \| null` | `null` | Rendered SVG HTML string |
| `error` | `string \| null` | `null` | Error message on render failure |

**Lifecycle**:

1. Component mounts → `useEffect` triggers
2. Generate unique ID: `mermaid-${crypto.randomUUID()}` (or counter-based fallback)
3. Call `mermaid.render(uniqueId, value)`
4. **Success**: Set `svg` state with returned SVG string
5. **Failure**: Set `error` state with error message

**Unique ID Generation**:

- `mermaid.render()` requires a unique DOM element ID
- Use module-level counter: `let idCounter = 0` → `mermaid-${idCounter++}`
- Ensures uniqueness across multiple MermaidBlock instances in the same summary

**Pseudocode**:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;
let idCounter = 0;

export function MermaidBlock({ value }: { value: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${idCounter++}`);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "neutral",
      });
      initialized = true;
    }

    let cancelled = false;

    mermaid
      .render(idRef.current, value)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to render chart");
      });

    return () => { cancelled = true; };
  }, [value]);

  if (error) {
    return (
      <div className="brutal-border bg-white p-3">
        <p className="mb-2 text-sm font-bold text-red-600">
          ⚠ Failed to render chart
        </p>
        <pre className="overflow-x-auto text-sm">
          <code>{value}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="brutal-border flex items-center justify-center bg-white p-6">
        <span className="text-sm text-gray-500">Rendering chart...</span>
      </div>
    );
  }

  return (
    <div
      className="brutal-border overflow-x-auto bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
```

### 3.2 ReactMarkdown Code Component Customization

**File**: `admin/src/components/agent/agent-message-bubble.tsx`

기존 `components.code` override에 Mermaid 분기를 추가한다:

```tsx
code({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");

  // Mermaid chart detection
  if (match && match[1] === "mermaid") {
    return <MermaidChart value={String(children).trim()} />;
  }

  // Existing fenced code block rendering
  if (match) {
    return (
      <pre className="brutal-border overflow-x-auto bg-white p-3 text-sm">
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  }

  // Existing inline code rendering
  return (
    <code className="bg-gray-200 px-1 py-0.5 font-mono text-sm" {...props}>
      {children}
    </code>
  );
},
```

**MermaidChart Dynamic Import** (SSR 방지):

```tsx
import dynamic from "next/dynamic";

const MermaidChart = dynamic(
  () => import("./mermaid-block").then((mod) => ({ default: mod.MermaidBlock })),
  {
    ssr: false,
    loading: () => (
      <div className="brutal-border flex items-center justify-center bg-white p-6">
        <span className="text-sm text-gray-500">Loading chart...</span>
      </div>
    ),
  }
);
```

### 3.3 Error Fallback UI

렌더링 실패 시 표시할 UI:

- Container: `brutal-border`, white background, padding
- Error indicator: Red text "⚠ Failed to render chart" (bold, small)
- Fallback content: Original Mermaid source code in `<pre><code>` block
- 사용자가 원본 코드를 확인할 수 있어 디버깅에 유용

---

## 4. Security

> **이 섹션은 Mermaid 렌더링에서 가장 중요한 부분이다.**

### 4.1 Threat Model

Mermaid 코드는 LLM이 생성한 텍스트이므로 **신뢰할 수 없는 입력(untrusted input)**으로 간주한다. 악의적인 프롬프트 주입 등으로 XSS 공격 벡터가 될 수 있다.

### 4.2 XSS Prevention — mermaid Built-in Security

- `mermaid.initialize({ securityLevel: 'strict' })` 필수 설정
- mermaid.js v10+의 `strict` 모드는:
  - SVG 내 `<script>` 태그 삽입을 차단
  - `on*` 이벤트 핸들러 속성을 제거
  - `<foreignObject>` 내 HTML 삽입을 제한
- Reference: https://mermaid.js.org/config/usage.html#security-and-modify-diagrams

### 4.3 SVG Insertion

- `mermaid.render()`가 반환하는 SVG는 mermaid 내부에서 sanitize된 결과
- `dangerouslySetInnerHTML` 사용이 불가피하나, `securityLevel: 'strict'` 설정이 전제 조건
- 추가 보안 레이어로 DOMPurify 적용을 권장하나, mermaid strict 모드가 1차 방어선이므로 초기 구현에서는 선택 사항

### 4.4 Prohibited Practices

- **rehype-raw 금지**: react-markdown에 `rehype-raw` 플러그인을 사용하지 않는다
- Mermaid 블록만 별도 `MermaidBlock` 컴포넌트로 분리하여 처리
- 사용자 입력이 직접 Mermaid 코드에 삽입되는 경로 없음 (LLM 생성 summary만 대상)

---

## 5. Performance Optimization

### 5.1 Lazy Loading (Code Splitting)

- `MermaidBlock` 컴포넌트를 `next/dynamic`으로 동적 import
- `ssr: false` 옵션으로 서버 사이드 렌더링 건너뜀 (mermaid.js는 브라우저 DOM API에 의존)
- Mermaid 코드 블록이 없는 메시지에서는 mermaid 라이브러리가 로드되지 않음

### 5.2 Single Initialization

- `mermaid.initialize()` 는 모듈 레벨 플래그(`initialized`)로 한 번만 호출
- 여러 `MermaidBlock` 인스턴스가 있어도 초기화는 최초 1회

### 5.3 Multiple Blocks in One Summary

- 한 summary에 여러 Mermaid 블록이 포함될 수 있음
- 각 블록은 독립적인 `MermaidBlock` 컴포넌트 인스턴스로 렌더링
- 각 인스턴스가 고유 ID를 가지므로 충돌 없이 병렬 렌더링 가능

---

## 6. Styling

### 6.1 SVG Container

| Property | Value | Rationale |
|----------|-------|-----------|
| Border | `brutal-border` (2px solid #000) | Neo-Brutalism consistency |
| Background | `bg-white` (#FFFFFF) | Clean chart background |
| Padding | `p-4` (16px) | Inner spacing for SVG |
| Overflow | `overflow-x-auto` | Horizontal scroll for wide charts |
| Max Width | Container width (100%) | Responsive within message bubble |

### 6.2 Mermaid Theme

- `theme: "neutral"` — mermaid 내장 테마 중 Neo-Brutalism과 가장 조화로운 중립 색상
- 커스텀 Mermaid 테마 설정 UI는 범위 밖

### 6.3 Responsive Behavior

- SVG는 컨테이너 너비에 맞게 자동 조정 (mermaid 기본 동작)
- 컨테이너가 메시지 버블의 max-width(85%)를 상속
- 매우 넓은 차트는 `overflow-x-auto`로 가로 스크롤 허용

### 6.4 Loading State

- `brutal-border`, white background, centered
- Text: "Rendering chart..." (gray-500, small)
- 별도 spinner 없이 텍스트 표시 (간결함 유지)

### 6.5 Error State

- `brutal-border`, white background
- Red warning text: "⚠ Failed to render chart"
- 원본 Mermaid 코드를 `<pre><code>` 블록으로 표시
- 기존 코드 블록 스타일과 동일한 패턴

---

## 7. Technical Implementation

### 7.1 Package Installation

```bash
npm install mermaid
```

### 7.2 File Structure

```
admin/src/components/agent/
├── agent-message-bubble.tsx   # Modified: add MermaidChart dynamic import + mermaid detection
├── mermaid-block.tsx           # New: MermaidBlock component
├── agent-execution-meta.tsx    # Unchanged
├── agent-message-area.tsx      # Unchanged
├── agent-sidebar.tsx           # Unchanged
├── agent-input.tsx             # Unchanged
└── agent-empty-state.tsx       # Unchanged
```

### 7.3 mermaid.initialize() Configuration

```typescript
mermaid.initialize({
  startOnLoad: false,       // Manual render, not auto-detect on DOM load
  securityLevel: "strict",  // XSS prevention (REQUIRED)
  theme: "neutral",         // Neo-Brutalism compatible neutral palette
});
```

### 7.4 SSR Considerations

- mermaid.js는 브라우저 DOM API(`document`, `window`)에 의존하여 SSR에서 실행 불가
- `MermaidBlock`은 `"use client"` directive 사용
- `next/dynamic`의 `ssr: false`로 동적 import하여 SSR 건너뜀
- SSR 단계에서는 loading placeholder가 표시됨

---

## 8. Scope

### Supported Chart Types

mermaid.js가 기본 지원하는 모든 차트 타입:

- Flowchart
- Sequence Diagram
- Class Diagram
- State Diagram
- Entity Relationship Diagram
- Gantt Chart
- Pie Chart
- Git Graph
- User Journey
- Mindmap
- Timeline
- 기타 mermaid.js 지원 타입

### Out of Scope

| Item | Reason |
|------|--------|
| Mermaid editor UI | Overengineering — summary is read-only |
| Chart export (PNG/PDF) | Overengineering — not needed for admin review |
| Interactive chart manipulation | Overengineering — static rendering suffices |
| Custom Mermaid theme settings UI | Overengineering — neutral theme is preset |
| DOMPurify integration | Optional enhancement — mermaid strict mode is primary defense |
| Syntax highlighting for mermaid source code | Low value — chart rendering replaces code view |
