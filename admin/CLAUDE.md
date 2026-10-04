# CLAUDE.md — Admin App

## 개요

관리자 계정 관리와 AI Agent 실행을 담당하는 내부 관리자 애플리케이션.

## 디자인 시스템: Neo-Brutalism

- **테두리(Border)**: `brutal-border` → `border: 2px solid #000000`
- **그림자(Shadow)**: `brutal-shadow` (4px), `brutal-shadow-sm` (2px), `brutal-shadow-lg` (6px)
- **호버(Hover)**: `brutal-hover` → transform + shadow 전환
- **테두리 반경(Border radius)**: 0 (모든 모서리를 각지게)
- **색상**: Primary `#3B82F6`, Background `#FFFFFF`, Foreground `#000000`, Secondary `#F5F5F5`, Accent `#DBEAFE`

## 아키텍처

### 이름 규칙

- **파일**: kebab-case (`agent-message-bubble.tsx`)
- **컴포넌트**: PascalCase (`AgentMessageBubble`)
- **타입**: 단수형 도메인 파일에 PascalCase (`auth.ts`, `agent.ts`)
- **API 모듈**: `{domain}-api.ts` (`agent-api.ts`, `admin-api.ts`)

### 핵심 패턴

- **인증**: HttpOnly 쿠키를 쓰는 BFF 패턴, JWT 토큰은 클라이언트에 절대 노출하지 않는다.
- **API 호출**: 401 자동 refresh와 에러 매핑을 처리하는 `authFetch()` 래퍼.
- **상태**: React Context API만 사용 (AuthContext, ToastContext). 외부 상태 라이브러리 없음.
- **컴포넌트**: 상호작용 컴포넌트는 `"use client"` 지시어. 훅을 쓰는 함수형 컴포넌트.
- **스타일**: Tailwind utility-first + `cn()` 헬퍼 (clsx + tailwind-merge). 변형 컴포넌트에는 CVA.
- **마크다운 렌더링**: `prose-brutal` 클래스가 ReactMarkdown 출력을 감싼다. code, table, link, blockquote에 대한 커스텀 `components` 오버라이드.
- **차트 데이터**: 백엔드가 Java `long`을 JSON 문자열로 직렬화하므로 `ChartData`의 `value`·`totalCount`는 string 타입이다. `agent-chart.tsx`에서 `Number()`로 변환해 그린다.

## 개발

```bash
cd admin
npm install
npm run dev    # http://localhost:3001
```

`npm run lint`는 현재 `eslint.config.mjs` 파일이 없어서 실행하면 에러가 난다.

API Gateway 프록시: `next.config.ts`가 `/api/:path*` → `http://localhost:8081/api/:path*`로 rewrite한다. `/api/bff/*`는 로컬 route handler가 먼저 처리한다. BFF route handler가 부르는 백엔드 주소는 `BACKEND_URL` 환경 변수로 바꿀 수 있다 (기본값 `http://localhost:8081`). rewrite 대상은 localhost로 하드코딩돼 있다.
