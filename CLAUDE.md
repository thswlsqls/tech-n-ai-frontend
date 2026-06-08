# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Response Language

가능하면 사용자에게 전달하는 모든 응답·설명·요약은 **한국어로 번역하여 출력**한다. 단, 코드, 식별자, 파일 경로, 명령어, 기술 용어(API/라이브러리 이름 등)는 원문(영어) 그대로 유지한다.

## 사람이 검증하는 텍스트 작성 규칙

주석, commit message, pull request 본문, 보고서, 설계 문서처럼 사람이 읽고 검증하는 모든 텍스트를 작성할 때 다음을 지킨다.

- LLM이 흔히 쓰는 상투적 표현을 피한다. (예: "원활하게", "견고한", "포괄적인", "~를 활용하여", 과한 강조 등)
- 개발자가 실제로 쓰지 않는 어휘를 피한다. 뜻을 지나치게 압축한 조어, 한자어 남발, 번역투, 사전에는 있어도 현업 대화에서 안 쓰는 단어는 더 쉽고 흔한 표현으로 바꾼다. (예: "정합성을 담보" → "데이터가 맞는지 확인", "기동" → "실행")
- 한 번 읽고 바로 이해되지 않는 문장은 풀어 쓴다. 독자가 멈춰서 다시 해석해야 한다면 잘못 쓴 것이다.
- 키워드를 나열하지 말고, 동료 개발자는 물론 비개발자 독자도 이해할 수 있도록 서술형 문장으로 풀어 쓴다.
- 불필요하게 과하게 설계하거나 부풀려 쓰지 않는다. 필요한 만큼만 쓴다.

판단 기준: 작성한 텍스트를 그 분야를 모르는 동료에게 소리 내어 읽어준다고 가정한다. 그대로 알아들으면 통과, 단어를 바꿔 설명해야 하면 다시 쓴다.

## Coding Behavioral Guidelines

LLM 코딩 실수를 줄이기 위한 행동 지침. 프로젝트별 지침과 함께 적용한다.
Tradeoff: 이 지침은 속도보다 신중함에 무게를 둔다. 사소한 작업에는 판단껏 적용한다.

### 1. Think Before Coding
가정하지 말 것. 헷갈림을 숨기지 말 것. 트레이드오프를 드러낼 것.
- 가정은 명시한다. 불확실하면 묻는다.
- 해석이 여러 갈래면 모두 제시한다. 조용히 하나만 고르지 않는다.
- 더 단순한 방법이 있으면 말한다. 근거가 있으면 반대 의견을 낸다.
- 불명확하면 멈춘다. 무엇이 헷갈리는지 짚고 묻는다.

### 2. Simplicity First
문제를 푸는 최소한의 코드만. 짐작으로 미리 만들지 않는다.
- 요청한 것 이상의 기능을 넣지 않는다.
- 한 번만 쓰는 코드에 추상화를 만들지 않는다.
- 요청하지 않은 "유연성"이나 "설정 가능성"을 넣지 않는다.
- 일어날 수 없는 상황에 대한 예외 처리를 넣지 않는다.
- 200줄을 썼는데 50줄로 가능하면 다시 쓴다.
- "시니어 개발자가 과하게 짰다고 할까?" 자문하고, 그렇다면 단순화한다.

### 3. Surgical Changes
꼭 필요한 것만 건드린다. 내가 만든 흔적만 치운다.
- 인접 코드·주석·포맷을 "개선"하지 않는다.
- 멀쩡한 코드를 리팩토링하지 않는다.
- 내 방식과 다르더라도 기존 스타일을 따른다.
- 관련 없는 죽은 코드를 발견하면 언급만 하고 지우지 않는다.
- 내 변경으로 안 쓰이게 된 import·변수·함수만 제거한다.
- 기존에 있던 죽은 코드는 요청 없이는 지우지 않는다.
- 기준: 바뀐 모든 줄은 사용자의 요청으로 곧장 설명돼야 한다.

### 4. Goal-Driven Execution
성공 기준을 정하고, 검증될 때까지 반복한다.
- "검증 추가" → "잘못된 입력에 대한 테스트를 먼저 쓰고 통과시킨다"
- "버그 수정" → "버그를 재현하는 테스트를 먼저 쓰고 통과시킨다"
- "X 리팩토링" → "리팩토링 전후로 테스트가 통과하는지 확인한다"
- 여러 단계 작업은 짧은 계획을 적는다: `1. [단계] → 검증: [확인 항목]`
- 약한 기준("동작하게")은 반복 질문을 부른다. 강한 기준이라야 혼자 반복할 수 있다.

이 지침이 잘 적용되면: diff에 불필요한 변경이 줄고, 과설계로 인한 재작성이 줄고, 질문이 실수 이후가 아니라 구현 이전에 나온다.

## 설계·구현 검증 원칙

설계하고 구현할 때 다음을 지킨다. 단, 단순함이 우선이며(2. Simplicity First), 원칙을 지키려고 코드를 부풀리지 않는다.

- 객체지향 설계 기법을 가능한 한 따른다. 단, 한 번만 쓰는 코드에 억지로 적용하지 않는다.
- 클린코드 원칙을 가능한 한 따른다. 이름, 함수 크기, 중복 제거를 신경 쓴다.
- 외부 자료는 신뢰할 수 있는 공식 출처(공식 문서·공식 저장소)를 최우선으로 참고한다.
- 판단이 서지 않으면 업계 표준 베스트 프랙티스를 참고한다.

## Repository Layout

This repo contains **two independent Next.js 16 apps** plus supporting docs — there is no root `package.json` or monorepo tooling. Run npm commands *inside each app directory*.

```
app/      # Public-facing user app   (Next.js 16, dev port 3000)
admin/    # Internal management app   (Next.js 16, dev port 3001)
docs/     # Korean PRDs, API specs, LLM prompts (see docs/CLAUDE.md)
devops/   # DevOps design docs + Terraform IaC
scripts/  # tmux dev-environment scripts
```

Both apps share the same stack: React 19, App Router, Tailwind v4 (`@tailwindcss/postcss`, CSS-variable theming in `src/app/globals.css`), shadcn/ui (new-york style, `components.json`), Radix UI, lucide icons. Path alias `@/*` → `./src/*`. `admin` additionally uses `recharts` (dashboards) and `react-markdown`/`remark-gfm`.

## Commands

Run from within `app/` or `admin/`:

```bash
npm run dev      # app → :3000, admin → :3001
npm run build    # next build
npm run start    # production server (admin pins :3001)
npm run lint     # eslint (flat config, eslint-config-next)
```

There is no test runner configured. `./scripts/tmux-frontend.sh` launches a tmux session with per-app windows.

## Architecture — Auth & API flow (the part to understand first)

Both apps use a **Backend-for-Frontend (BFF) pattern**. Tokens are never exposed to client JavaScript. The same flow exists in `app/` and `admin/`, so changes usually must be mirrored in both.

1. **Login** — `POST /api/bff/auth/login` (a Next route handler) forwards credentials to the real backend, then sets `access_token` and `refresh_token` as **HttpOnly cookies** (`src/lib/cookie-config.ts`). It returns only non-sensitive user info, decoded from the JWT payload.
2. **Request proxying** — `next.config.ts` rewrites `/api/:path*` → `http://localhost:8081/api/:path*` (the backend). Because filesystem route handlers take precedence over `afterFiles` rewrites, `/api/bff/*` is handled locally while `/api/v1/*` falls through to the backend.
3. **Token injection** — `src/middleware.ts` matches only `/api/v1/:path*` and injects `Authorization: Bearer <access_token>` read from the cookie. Client code therefore never sets the auth header itself.
4. **Authenticated client calls** — `src/lib/auth-fetch.ts`'s `authFetch()` wraps `fetch`. On `401` it calls `POST /api/bff/auth/refresh` (deduplicated via a module-level singleton promise so concurrent calls trigger one refresh), retries once, and otherwise redirects to `/signin`. The refresh route rotates both cookies and clears them on failure.
5. **Client auth state** — `src/contexts/auth-context.tsx` restores the user on mount via `GET /api/bff/auth/me`; it holds user info only, never tokens.

`BACKEND_URL` (default `http://localhost:8081`) configures the backend origin used by BFF route handlers. The `next.config.ts` rewrite destination is currently hardcoded to localhost.

### API response envelope

The backend wraps responses as `{ code, messageCode: { code, text }, data }`.
- `parseResponse<T>` / `parseVoidResponse` in `auth-fetch.ts` unwrap `data` and, on non-OK, throw `AuthError(message, status, code)`.
- Error messages are resolved by `getErrorMessage()` from a `messageCode.code → English string` table (`ERROR_MESSAGES`), falling back to an HTTP-status table. Add new backend error codes to `ERROR_MESSAGES`.
- `app/src/lib/api.ts` additionally normalizes paginated responses that may arrive in legacy (`items`/`totalCount`) or current (`list`/`totalSize`) shapes into `PageData<T>`.

### Domain API modules

Per-domain wrappers live in `src/lib/*-api.ts` and all build on `authFetch` + `parseResponse`:
- `app`: `auth-api.ts`, `bookmark-api.ts`, `chatbot-api.ts` (chat sessions/messages), `api.ts` (public emerging-tech feed — uses plain `fetch`, no auth).
- `admin`: `auth-api.ts`, `admin-api.ts` (accounts), `agent-api.ts` (agent runs + sessions).

## Conventions

- **Language**: documentation in Korean (technical terms stay English); code, UI text, and error strings in English.
- **Package manager**: npm.
- **Git commits**: `type : [branch] description` (e.g. `feat : [main] JWT token security`).
- **Scope discipline**: implement only what is required — avoid speculative abstractions, fallbacks, or error handling for cases that cannot occur. Reference official framework/library docs, not blog posts or tutorials.
- **docs/**: sequentially numbered `NNN-name.md` files (see `docs/CLAUDE.md` for the full numbering/format spec).
