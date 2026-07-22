# Tech-N-AI Frontend

Tech-N-AI 서비스의 프런트엔드 저장소다. 독립적인 Next.js 앱 두 개가 들어 있다.

- `app/` — 공개 사용자 앱. AI/신기술 동향 조회, 북마크, RAG 챗봇. dev 포트 3000.
- `admin/` — 내부 관리자 앱. 계정 관리, AI Agent 실행, 대시보드. dev 포트 3001.

백엔드 저장소 `tech-n-ai-backend`(Spring Boot MSA)와 짝을 이루며, 두 앱 모두 API 요청을 백엔드 게이트웨이(`http://localhost:8081`)로 프록시한다.

## 기술 스택

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4, shadcn/ui 방식 컴포넌트, Radix UI, lucide 아이콘
- `admin`은 추가로 recharts(차트), react-markdown/remark-gfm(마크다운 렌더링)을 쓴다

루트에는 `package.json`이 없다. 각 앱이 자체 `package.json`을 가진 별도 npm 프로젝트다.

## 디렉터리 구성

```
app/      # 공개 사용자 앱 (포트 3000)
admin/    # 내부 관리자 앱 (포트 3001)
docs/     # PRD, API 명세, 버그 기록, LLM 프롬프트 (docs/README.md 참고)
devops/   # AWS 배포 설계 프롬프트·산출물, Terraform 코드
scripts/  # tmux 개발 환경 스크립트와 가이드 문서
```

## 로컬 실행

앱마다 디렉터리에 들어가서 실행한다.

```bash
cd app      # 또는 cd admin
npm install
npm run dev   # app → http://localhost:3000, admin → http://localhost:3001
```

`scripts/tmux-frontend.sh`를 쓰면 두 앱의 개발 창을 갖춘 tmux 세션을 한 번에 띄울 수 있다.

## 상세 문서

- 공개 앱: [`app/README.md`](./app/README.md)
- 관리자 앱: [`admin/README.md`](./admin/README.md)
- 문서 디렉터리 안내: [`docs/README.md`](./docs/README.md)
