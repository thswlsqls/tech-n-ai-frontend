# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 지침이다.

## 응답 언어

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

- 클린코드 원칙을 가능한 한 따른다. 이름, 함수 크기, 중복 제거를 신경 쓴다.
- 외부 자료는 신뢰할 수 있는 공식 출처(공식 문서·공식 저장소)를 최우선으로 참고한다.
- 판단이 서지 않으면 업계 표준 베스트 프랙티스를 참고한다.

## 저장소 구성

이 저장소에는 **독립적인 Next.js 16 앱 두 개**와 보조 문서가 들어 있다 — 루트에는 `package.json`이나 모노레포 도구가 없다. npm 명령은 *각 앱 디렉터리 안에서* 실행한다.

```
app/      # 공개 사용자 앱        (Next.js 16, dev 포트 3000)
admin/    # 내부 관리 앱          (Next.js 16, dev 포트 3001)
docs/     # 한국어 PRD, API 명세, LLM 프롬프트 (docs/CLAUDE.md 참고)
devops/   # DevOps 설계 문서 + Terraform IaC
scripts/  # tmux 개발 환경 스크립트
```

두 앱은 같은 스택을 공유한다: React 19, App Router, Tailwind v4 (`@tailwindcss/postcss`, `src/app/globals.css`의 CSS 변수 테마), shadcn/ui (new-york 스타일, `components.json`), Radix UI, lucide 아이콘. 경로 별칭 `@/*` → `./src/*`. `admin`은 여기에 더해 `recharts`(대시보드)와 `react-markdown`/`remark-gfm`을 쓴다.

## 명령어

`app/` 또는 `admin/` 안에서 실행한다:

```bash
npm run dev      # app → :3000, admin → :3001
npm run build    # next build
npm run start    # 프로덕션 서버 (admin은 :3001 고정)
npm run lint     # eslint (flat config, eslint-config-next)
```

테스트 러너는 설정돼 있지 않다. `./scripts/tmux-frontend.sh`가 앱별 창을 갖춘 tmux 세션을 띄운다.

## 아키텍처 — 인증 & API 흐름 (가장 먼저 이해할 부분)

두 앱 모두 **Backend-for-Frontend (BFF) 패턴**을 쓴다. 토큰은 클라이언트 JavaScript에 절대 노출되지 않는다. `app/`과 `admin/`에 같은 흐름이 있으므로, 보통 한쪽을 바꾸면 다른 쪽에도 똑같이 반영해야 한다.

1. **로그인** — `POST /api/bff/auth/login` (Next route handler)이 자격 증명을 실제 백엔드로 넘긴 뒤, `access_token`과 `refresh_token`을 **HttpOnly 쿠키**로 설정한다 (`src/lib/cookie-config.ts`). 응답으로는 JWT 페이로드에서 디코딩한, 민감하지 않은 사용자 정보만 돌려준다.
2. **요청 프록시** — `next.config.ts`가 `/api/:path*` → `http://localhost:8081/api/:path*`(백엔드)로 rewrite한다. 파일시스템 route handler가 `afterFiles` rewrite보다 우선하므로, `/api/bff/*`는 로컬에서 처리되고 `/api/v1/*`는 백엔드로 넘어간다.
3. **토큰 주입** — `src/middleware.ts`는 `/api/v1/:path*`만 매칭해서 쿠키에서 읽은 `Authorization: Bearer <access_token>`을 주입한다. 따라서 클라이언트 코드는 인증 헤더를 직접 설정하지 않는다.
4. **인증된 클라이언트 호출** — `src/lib/auth-fetch.ts`의 `authFetch()`가 `fetch`를 감싼다. `401`이 오면 `POST /api/bff/auth/refresh`를 호출하고(모듈 수준 싱글턴 promise로 중복을 제거해, 동시 호출이 와도 refresh는 한 번만 일어난다), 한 번 재시도하며, 그래도 안 되면 `/signin`으로 리다이렉트한다. refresh route는 두 쿠키를 모두 갱신하고, 실패 시 비운다.
5. **클라이언트 인증 상태** — `src/contexts/auth-context.tsx`가 마운트 시 `GET /api/bff/auth/me`로 사용자를 복원한다. 사용자 정보만 들고 있고 토큰은 절대 보관하지 않는다.

`BACKEND_URL`(기본값 `http://localhost:8081`)은 BFF route handler가 쓰는 백엔드 origin을 설정한다. `next.config.ts`의 rewrite 대상은 현재 localhost로 하드코딩돼 있다.

### API 응답 봉투(envelope)

백엔드는 응답을 `{ code, messageCode: { code, text }, data }` 형태로 감싼다.
- `auth-fetch.ts`의 `parseResponse<T>` / `parseVoidResponse`가 `data`를 꺼내고, 정상이 아니면 `AuthError(message, status, code)`를 던진다.
- 에러 메시지는 `getErrorMessage()`가 `messageCode.code → 영어 문자열` 표(`ERROR_MESSAGES`)에서 찾고, 없으면 HTTP 상태 표로 대체한다. 백엔드 에러 코드가 새로 생기면 `ERROR_MESSAGES`에 추가한다.
- `app/src/lib/api.ts`는 추가로, 구버전(`items`/`totalCount`)이나 현재(`list`/`totalSize`) 형태로 오는 페이지네이션 응답을 `PageData<T>`로 정규화한다.

### 도메인 API 모듈

도메인별 래퍼는 `src/lib/*-api.ts`에 있고 모두 `authFetch` + `parseResponse` 위에 만들어진다:
- `app`: `auth-api.ts`, `bookmark-api.ts`, `chatbot-api.ts` (채팅 세션/메시지), `api.ts` (공개 emerging-tech 피드 — 인증 없이 일반 `fetch` 사용).
- `admin`: `auth-api.ts`, `admin-api.ts` (계정), `agent-api.ts` (에이전트 실행 + 세션).

## 규칙

- **언어**: 문서는 한국어(기술 용어는 영어 유지), 코드·UI 텍스트·에러 문자열은 영어.
- **패키지 매니저**: npm.
- **Git 커밋**: `type : [branch] description` (예: `feat : [main] JWT token security`).
- **범위 지키기**: 필요한 것만 구현한다 — 짐작에 따른 추상화, 폴백, 일어날 수 없는 경우의 에러 처리를 넣지 않는다. 블로그나 튜토리얼이 아니라 공식 프레임워크/라이브러리 문서를 참고한다.
- **docs/**: 순번이 붙은 `NNN-name.md` 파일 (전체 번호/형식 규칙은 `docs/CLAUDE.md` 참고).
