# CLAUDE.md — User App

## 개요

Emerging Tech 업데이트 탐색, 챗봇 상호작용, 북마크 관리를 제공하는 공개 사용자 애플리케이션.

## 디자인 시스템: Neo-Brutalism

Admin App과 동일한 디자인 토큰 (`src/app/globals.css`의 utility 클래스):
- **테두리(Border)**: `brutal-border` (2px solid #000), `brutal-border-3` (3px)
- **그림자(Shadow)**: `brutal-shadow-sm` (2px), `brutal-shadow` (4px), `brutal-shadow-lg` (6px)
- **호버(Hover)**: `brutal-hover` (hover 시 translate + 그림자 축소)
- **테두리 반경(Border radius)**: 0 (`--radius: 0rem`)
- **색상**: Primary `#3B82F6`, Background `#FFFFFF`, Foreground `#000000`

## 아키텍처

### 이름 규칙

- **파일**: kebab-case (`chat-input.tsx`)
- **컴포넌트**: PascalCase (`ChatInput`)
- **타입**: 단수형 도메인 파일에 PascalCase (`chatbot.ts`, `bookmark.ts`)
- **API 모듈**: `{domain}-api.ts` (`chatbot-api.ts`, `bookmark-api.ts`)

### 핵심 패턴

- **인증**: HttpOnly 쿠키를 쓰는 BFF 패턴. 이메일/비밀번호 + Google OAuth 지원.
- **토큰 주입**: `src/middleware.ts`가 `/api/v1/*` 요청에만 쿠키의 access token을 `Authorization: Bearer` 헤더로 넣는다. 클라이언트 코드는 인증 헤더를 직접 설정하지 않는다.
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

API Gateway 프록시: `next.config.ts`가 `/api/:path*` → `http://localhost:8081`로 rewrite한다 (`/api/bff/*`는 로컬 route handler가 먼저 처리). BFF 라우트가 부르는 백엔드 origin은 환경 변수 `BACKEND_URL`로 바꿀 수 있다 (기본값 `http://localhost:8081`, `src/lib/cookie-config.ts`).
