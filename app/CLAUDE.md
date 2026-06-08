# CLAUDE.md — User App

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

## 개요

Emerging Tech 업데이트 탐색, 챗봇 상호작용, 북마크 관리를 제공하는 공개 사용자 애플리케이션.

## 기술 스택

| 항목 | 버전 |
|------|---------|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | 5 (strict 모드) |
| Tailwind CSS | 4 |
| UI Primitives | Radix UI |
| 컴포넌트 변형(variant) | class-variance-authority (CVA) |
| 아이콘 | Lucide React |
| 폰트 | Space Grotesk (sans), DM Mono (mono) |
| 날짜 유틸리티 | date-fns, react-day-picker |

## 디자인 시스템: Neo-Brutalism

Admin App과 동일한 디자인 토큰:
- **테두리(Border)**: `brutal-border` → `border: 2px solid #000000`
- **그림자(Shadow)**: `brutal-shadow-sm` (2px), `brutal-shadow` (4px)
- **호버(Hover)**: `brutal-hover`
- **테두리 반경(Border radius)**: 0
- **색상**: Primary `#3B82F6`, Background `#FFFFFF`, Foreground `#000000`

## 아키텍처

### 디렉터리 구조

```
app/src/
├── app/                # 페이지 (App Router)
│   ├── api/bff/       # BFF 인증 엔드포인트 (login, logout, refresh, me, oauth)
│   ├── chat/          # 챗봇 페이지
│   ├── bookmarks/     # 북마크 관리
│   ├── signin/signup/verify-email/reset-password/
│   └── globals.css
├── components/
│   ├── ui/            # 기본 UI (button, input, dialog, popover, badge, calendar)
│   ├── auth/          # 인증 컴포넌트
│   ├── chatbot/       # 챗봇 기능 컴포넌트
│   ├── bookmark/      # 북마크 컴포넌트
│   └── emerging-tech/ # emerging tech 목록 컴포넌트
├── contexts/          # React Context (auth, toast)
├── lib/               # API 클라이언트, 유틸리티, auth-fetch
└── types/             # TypeScript 타입 정의
```

### 이름 규칙

- **파일**: kebab-case (`chat-input.tsx`)
- **컴포넌트**: PascalCase (`ChatInput`)
- **타입**: 단수형 도메인 파일에 PascalCase (`chatbot.ts`, `bookmark.ts`)
- **API 모듈**: `{domain}-api.ts` (`chatbot-api.ts`, `bookmark-api.ts`)

### 핵심 패턴

- **인증**: HttpOnly 쿠키를 쓰는 BFF 패턴. 이메일/비밀번호 + Google OAuth 지원.
- **API 호출**: 401 자동 refresh를 처리하는 `authFetch()` 래퍼.
- **상태**: React Context API만 사용 (AuthContext, ToastContext).
- **컴포넌트**: 상호작용 컴포넌트는 `"use client"`. 함수형 + 훅.
- **스타일**: Tailwind utility-first + `cn()` 헬퍼. 변형 컴포넌트에는 CVA.

## 개발

```bash
cd app
npm install
npm run dev    # http://localhost:3000
```

API Gateway 프록시: `next.config.ts`가 `/api/*` → `http://localhost:8081`로 rewrite한다.
