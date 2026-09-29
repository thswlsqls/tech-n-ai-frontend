# Tech-N-AI Frontend

Tech-N-AI 서비스의 프런트엔드 저장소입니다. 서로 독립된 Next.js 앱 두 개가 들어 있습니다.

| 앱 | 용도 | 개발 포트 |
|---|---|---|
| [`app/`](./app/README.md) | 공개 사용자 앱. AI 기술 동향 조회, 북마크, RAG 챗봇 | 3000 |
| [`admin/`](./admin/README.md) | 내부 관리자 앱. 관리자 계정 관리, AI Agent 실행 | 3001 |

백엔드 저장소 `tech-n-ai-backend`(Spring Boot MSA)와 함께 동작합니다. 두 앱 모두 브라우저의 API 요청을 백엔드 게이트웨이(`http://localhost:8081`)로 넘깁니다.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- Tailwind CSS 4, Radix UI, class-variance-authority, Lucide 아이콘
- 두 앱이 같은 Neo-Brutalism 디자인 토큰(`brutal-border`, `brutal-shadow` 등)을 씁니다.
- `admin`은 차트를 그리는 Recharts와 마크다운을 보여주는 react-markdown·remark-gfm을 추가로 씁니다.

루트에는 `package.json`이 없습니다. 앱마다 자기 `package.json`을 가진 별도 npm 프로젝트입니다.

## 디렉터리 구성

```
app/      # 공개 사용자 앱 (포트 3000)
admin/    # 내부 관리자 앱 (포트 3001)
docs/     # PRD, API 명세, 버그 기록, LLM 프롬프트 (docs/README.md 참고)
devops/   # AWS 배포 설계 프롬프트와 결과물, Terraform 코드
scripts/  # tmux 개발 환경 스크립트와 가이드 문서
```

## 로컬 실행

Node.js 20.9 이상이 필요하고, 백엔드 게이트웨이가 `http://localhost:8081`에서 실행 중이어야 합니다.

```bash
cd app        # 또는 cd admin
npm install
npm run dev   # app → http://localhost:3000, admin → http://localhost:3001
```

`./scripts/tmux-frontend.sh`를 실행하면 앱별 작업 창이 나뉜 tmux 세션이 한 번에 열립니다.

### 백엔드 연결

- 브라우저에서 `/api/*`로 보내는 요청은 `next.config.ts`의 rewrite 설정에 따라 `http://localhost:8081`로 전달됩니다. 이 주소는 코드에 고정돼 있습니다.
- 로그인·토큰 갱신 같은 인증 요청은 앱 안의 BFF 라우트(`/api/bff/*`)가 먼저 받아 처리합니다. BFF가 호출하는 백엔드 주소는 `BACKEND_URL` 환경 변수로 바꿀 수 있고, 기본값은 `http://localhost:8081`입니다.
- JWT는 HttpOnly 쿠키에만 저장되므로 브라우저 JavaScript에서는 읽을 수 없습니다. `middleware.ts`가 `/api/v1/*` 요청에 쿠키의 토큰을 `Authorization` 헤더로 넣어 줍니다.

## 스크립트

두 앱 모두 같은 npm 스크립트를 가집니다.

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과로 서버 실행 |
| `npm run lint` | ESLint 실행 (`admin`은 설정 파일이 없어 현재 에러가 납니다) |

테스트 러너는 아직 설정돼 있지 않습니다.

## 더 보기

- 공개 사용자 앱: [`app/README.md`](./app/README.md)
- 관리자 앱: [`admin/README.md`](./admin/README.md)
- 기획·API 문서: [`docs/README.md`](./docs/README.md)
