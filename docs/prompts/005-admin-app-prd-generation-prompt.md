# Admin App PRD 작성 프롬프트

---

## 사용법

아래 프롬프트를 LLM에 입력하여 PRD를 생성한다. `<api-spec>` 영역에 Auth API 설계서 전문을 삽입한다.

---

## 프롬프트

```
당신은 시니어 프론트엔드 프로덕트 매니저입니다. 아래 제공하는 Auth API 설계서의 관리자 API 섹션과 요구사항을 기반으로, 독립된 관리자 웹 애플리케이션의 프론트엔드 PRD(Product Requirements Document)를 작성하세요.

# 역할
- 프론트엔드 PRD 작성 전문가
- API 스펙을 읽고 프론트엔드 관점의 요구사항으로 변환
- 관리자 대시보드 UI/UX 베스트 프랙티스에 정통
- 클린 코드 원칙과 업계 표준에 정통

# 입력 자료

<api-spec>
{여기에 docs/API-specifications/api-auth-specification.md 전문 삽입}
</api-spec>

# 프로젝트 기본 정보

| 항목 | 내용 |
|------|------|
| 앱 이름 | Admin App |
| 앱 위치 | `/admin` (기존 `/app`과 독립된 별도 Next.js 프로젝트) |
| 기술 스택 | Next.js 16 (App Router) + React 19 + TypeScript |
| UI 라이브러리 | Radix UI + CVA (class-variance-authority) |
| 스타일링 | Tailwind CSS v4 + 커스텀 Neo-Brutalism 유틸리티 |
| 아이콘 | Lucide React |
| 폰트 | Space Grotesk (sans), DM Mono (mono) |
| 디자인 테마 | Neo-Brutalism |
| 색상 테마 | Primary Blue (#3B82F6), Accent Light Blue (#DBEAFE), Black (#000000), White (#FFFFFF), Gray (#F5F5F5), Destructive Red (#EF4444) |
| API Gateway | http://localhost:8081 (Next.js rewrites로 /api/* → Gateway 프록시) |
| 인증 | JWT 기반 (Bearer 토큰, ADMIN 권한). 관리자 전용 로그인 엔드포인트 사용 |
| UI 언어 | 영문 (화면에 표시되는 모든 텍스트는 영문 사용) |

# 독립 앱 설계 원칙

이 Admin App은 기존 사용자 앱(`/app`)과 **완전히 독립된 별도의 Next.js 프로젝트**로 설계한다.

## 독립성 요구사항
- 자체 `package.json`, `next.config.ts`, `tsconfig.json` 보유
- 자체 `src/` 디렉토리 구조 보유 (아래 디렉토리 구조 참조)
- 기존 `/app` 프로젝트와 코드 공유 없음 (import 경로 독립)
- 독립적으로 `npm install && npm run dev`로 즉시 실행 가능
- 별도 포트에서 독립 실행 (예: 3001)

## 기존 앱과의 일관성 요구사항
- 동일한 디자인 테마(Neo-Brutalism) 적용: 동일한 globals.css 디자인 토큰 및 유틸리티 클래스
- 동일한 기술 스택 및 라이브러리 버전 사용
- 동일한 코드 구조 및 파일 네이밍 컨벤션 (kebab-case 파일명, PascalCase export)
- 동일한 API 통신 패턴 (`authFetch` + `parseResponse` 패턴)
- 동일한 컴포넌트 설계 패턴 (Radix UI + CVA + cn 유틸리티)

# 참조: 기존 앱(`/app`) 코드베이스 컨텍스트

기존 앱의 패턴을 그대로 따라야 한다. 아래는 기존 앱에서 확립된 패턴이다.

## 디자인 시스템: Neo-Brutalism
- `.brutal-shadow`: box-shadow 4px 4px 0px 0px #000000
- `.brutal-shadow-sm`: box-shadow 2px 2px 0px 0px #000000
- `.brutal-shadow-lg`: box-shadow 6px 6px 0px 0px #000000
- `.brutal-border`: border 2px solid #000000
- `.brutal-border-3`: border 3px solid #000000
- `.brutal-hover`: hover 시 translate(2px, 2px) + shadow 축소, active 시 translate(4px, 4px) + shadow 제거
- border-radius: 0 (모든 요소 직각, --radius: 0rem)
- 색상 변수: --primary (#3B82F6), --accent (#DBEAFE), --secondary (#F5F5F5), --destructive (#EF4444), --foreground (#000000), --background (#FFFFFF)

## 인증 인프라 패턴 (Admin App에서 동일하게 재구현)
기존 앱의 `lib/auth-fetch.ts` 패턴을 Admin App에서 동일하게 구현한다:

```typescript
// lib/auth-fetch.ts 패턴
// authFetch() — JWT Authorization 헤더 자동 첨부, 401 시 토큰 자동 갱신, 갱신 실패 시 로그인 페이지 리다이렉트
// parseResponse<T>() — ApiResponse<T>에서 data 추출 및 에러 처리
// parseVoidResponse() — 응답 바디 없는 API용
// AuthError 클래스 — status, code 포함 에러

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = { ...options.headers as Record<string, string> };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    // refreshAccessToken() 호출 후 재시도
    // 갱신 실패 시 clearTokens() + 로그인 페이지 리다이렉트
  }
  return res;
}
```

## 인증 Context 패턴

```typescript
// contexts/auth-context.tsx 패턴
// AuthProvider — localStorage에서 토큰/유저 정보 hydration
// useAuth() — { user, isLoading, login, logout } 제공
// 클라이언트 사이드 인증 가드: useEffect로 미인증 시 로그인 리다이렉트
```

## Toast Context 패턴

```typescript
// contexts/toast-context.tsx 패턴
// ToastProvider — 전역 토스트 알림 제공
// useToast() — showToast(message, type) 제공
```

## API 클라이언트 패턴

```typescript
// lib/admin-api.ts 패턴 (기존 bookmark-api.ts와 동일한 패턴)
import { authFetch, parseResponse, parseVoidResponse } from "@/lib/auth-fetch";

const BASE = "/api/v1/auth/admin";

export async function fetchAdminAccounts(): Promise<AdminResponse[]> {
  const res = await authFetch(`${BASE}/accounts`);
  return parseResponse<AdminResponse[]>(res);
}

export async function createAdminAccount(req: AdminCreateRequest): Promise<AdminResponse> {
  const res = await authFetch(`${BASE}/accounts`, {
    method: "POST",
    body: JSON.stringify(req),
  });
  return parseResponse<AdminResponse>(res);
}
```

## 공통 타입

```typescript
// types/auth.ts
export interface ApiResponse<T> {
  code: string;
  messageCode: { code: string; text: string };
  message: string;
  data: T;
}
```

## 프로젝트 디렉토리 구조 (Admin App)
```
admin/
├── package.json
├── next.config.ts                 (API 프록시 rewrites 설정)
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx              (루트 레이아웃, AuthProvider + ToastProvider 감싸기)
    │   ├── page.tsx                (대시보드 또는 로그인 리다이렉트)
    │   ├── globals.css             (글로벌 스타일 + Neo-Brutalism 유틸리티, 기존 앱과 동일)
    │   ├── signin/page.tsx         (관리자 로그인)
    │   └── accounts/page.tsx       (관리자 계정 관리)
    ├── components/
    │   ├── ui/                     (공통 UI: button, input, dialog, badge 등)
    │   ├── auth/                   (관리자 인증 관련 컴포넌트)
    │   └── admin/                  (관리자 계정 관리 컴포넌트)
    ├── contexts/
    │   ├── auth-context.tsx        (관리자 인증 상태 Context)
    │   └── toast-context.tsx       (토스트 알림 Context)
    ├── lib/
    │   ├── auth-api.ts             (관리자 로그인/로그아웃 API)
    │   ├── admin-api.ts            (관리자 계정 CRUD API)
    │   ├── auth-fetch.ts           (인증 fetch 래퍼)
    │   └── utils.ts                (cn 헬퍼, 유효성 검증)
    └── types/
        ├── auth.ts                 (TokenResponse, AdminUser, ApiResponse<T> 등)
        └── admin.ts                (AdminResponse, AdminCreateRequest, AdminUpdateRequest 등)
```

# 기능 요구사항

## 목적
관리자가 관리자 계정을 관리할 수 있는 독립된 관리자 웹 애플리케이션을 구현한다. 관리자 전용 로그인 엔드포인트를 사용하며, 인증된 관리자만 접근 가능하다.

## 전제 조건
- 관리자 전용 로그인(`POST /api/v1/auth/admin/login`)으로만 인증
- 모든 관리자 API는 ADMIN 권한 Bearer 토큰 필요
- 비인증 상태에서는 로그인 페이지로 리다이렉트
- 자기 자신의 계정은 삭제 불가 (API 레벨에서 403 반환)

## F1. 관리자 로그인 (`/signin`)
- 사용 API: `POST /api/v1/auth/admin/login`
- 입력 필드: Email, Password
- 클라이언트 유효성 검증:
  - Email: 이메일 형식
  - Password: 빈 값 방지
- 성공 시: TokenResponse의 accessToken, refreshToken 저장 → 대시보드(`/`)로 리다이렉트
- 에러 처리: 401 이메일/비밀번호 불일치, 비활성화/삭제된 관리자 계정
- 일반 사용자 로그인 UI와 구분되는 "Admin Login" 타이틀 표시

## F2. 관리자 대시보드 (`/`)
- 인증된 관리자만 접근 가능
- 관리자 계정 관리(`/accounts`)로의 네비게이션 제공
- 헤더: "Admin Dashboard" 타이틀 + 로그인된 관리자 정보 + 로그아웃 버튼
- 초기 버전에서는 관리자 계정 관리 기능만 포함

## F3. 관리자 계정 목록 (`/accounts`)
- 사용 API: `GET /api/v1/auth/admin/accounts`
- 활성 상태(isActive=true)이고 삭제되지 않은(isDeleted=false) 관리자 목록 테이블 표시
- 테이블 컬럼: ID, Email, Username, Role, Active 상태, 생성일, 마지막 로그인, 액션
- 액션: 상세 보기, 수정, 삭제
- 상단에 "Create Account" 버튼 배치

## F4. 관리자 계정 생성
- 사용 API: `POST /api/v1/auth/admin/accounts`
- 접근: 계정 목록 페이지의 "Create Account" 버튼 → 생성 다이얼로그 또는 인라인 폼
- 입력 필드: Email, Username, Password
- 클라이언트 유효성 검증:
  - Email: 이메일 형식
  - Username: 2~50자
  - Password: 최소 8자
- 성공 시: 목록 새로고침 + 성공 토스트
- 에러 처리: 400 유효성 실패 (이메일/사용자명 중복 포함)

## F5. 관리자 상세 조회
- 사용 API: `GET /api/v1/auth/admin/accounts/{adminId}`
- 접근: 테이블 행 클릭 또는 상세 보기 액션
- AdminResponse 필드 전체 표시: id, email, username, role, isActive, createdAt, lastLoginAt
- 다이얼로그 또는 인라인 상세 패널로 표시

## F6. 관리자 정보 수정
- 사용 API: `PUT /api/v1/auth/admin/accounts/{adminId}`
- 접근: 테이블의 수정 액션
- 수정 가능 필드: Username (2~50자), Password (최소 8자, 선택)
- 클라이언트 유효성 검증 적용
- 성공 시: 목록 새로고침 + 성공 토스트
- 에러 처리: 400 유효성 실패 (사용자명 중복), 404 관리자 없음

## F7. 관리자 계정 삭제
- 사용 API: `DELETE /api/v1/auth/admin/accounts/{adminId}`
- 삭제 전 확인 다이얼로그 표시 ("Are you sure?" 확인)
- 자기 자신 삭제 시도 시: 403 에러 → 사용자 친화적 메시지 표시 ("Cannot delete your own account")
- 성공 시: 목록에서 제거 + 성공 토스트
- Soft delete 방식 (API 레벨에서 처리)

## F8. 로그아웃
- 사용 API: `POST /api/v1/auth/logout`
- 헤더의 Logout 버튼 클릭 시 호출
- Request: Authorization 헤더 + refreshToken body 전송
- 성공/실패 무관하게 클라이언트 토큰 제거 + 로그인 페이지 이동

## F9. 토큰 관리
- 사용 API: `POST /api/v1/auth/refresh`
- accessToken, refreshToken localStorage 저장
- API 요청 시 Authorization 헤더에 Bearer 토큰 자동 첨부
- accessToken 만료(401 응답) 시 refreshToken으로 자동 갱신 시도
- refreshToken 만료 시 로그아웃 처리 (토큰 제거 + 로그인 페이지 이동)
- 동시 다중 요청 시 토큰 갱신 중복 방지 (singleton refresh promise 패턴)

# 관리자 대시보드 UI/UX 베스트 프랙티스 가이드

PRD 작성 시 아래 업계 표준 베스트 프랙티스를 반영하세요:

## 테이블 UI
1. **데이터 테이블**: 관리자 목록은 정렬 가능한 테이블로 표시. 헤더 고정, 행별 액션 버튼 제공.
2. **Empty State**: 관리자 목록이 비어있을 때 안내 메시지와 계정 생성 CTA 표시.
3. **로딩 상태**: 데이터 로딩 중 스켈레톤 또는 로딩 스피너 표시.

## 폼 UI
4. **인라인 유효성 검증**: 입력 필드 포커스 아웃 시 즉시 유효성 검증 피드백.
5. **서버 에러 표시**: API 에러(이메일/사용자명 중복 등)를 해당 필드 아래에 인라인 표시.
6. **제출 상태**: 폼 제출 중 버튼 비활성화 + 로딩 인디케이터.

## 확인 다이얼로그
7. **삭제 확인**: 파괴적 액션(삭제)에 확인 다이얼로그 필수. 대상 계정 정보 포함.
8. **명확한 CTA**: 확인 버튼에 "Delete", "Cancel" 등 명확한 액션명 사용. Destructive 버튼에 빨간색 적용.

## 네비게이션
9. **헤더 레이아웃**: 좌측 앱 타이틀, 우측 사용자 정보 + 로그아웃 버튼.
10. **사이드바 또는 탭 네비게이션**: 확장 가능한 네비게이션 구조. 초기 버전은 단순 헤더 네비게이션으로 충분.

## 에러 및 상태 처리
11. **Loading States**: 목록 로딩, 폼 제출, 삭제 처리 각각 적절한 로딩 UI 표시.
12. **Error States**: API 에러 발생 시 토스트 알림으로 사용자 친화적 에러 메시지 표시.
13. **Optimistic Update**: 삭제 시 optimistic update 고려 (즉시 UI 반영 후 실패 시 롤백).

## 디자인 일관성
14. **메인 앱 테마 일관성**: 기존 사용자 앱(`/app`)의 Neo-Brutalism 디자인 시스템과 완전히 일관되어야 한다. brutal-shadow, brutal-border, brutal-hover 유틸리티 클래스를 동일하게 활용. 직각 border-radius, 동일 색상 팔레트, 동일 폰트를 적용.
15. **컴포넌트 패턴 일관성**: 기존 앱과 동일한 Radix UI + CVA 기반 UI 프리미티브 패턴 사용. `cn()` 유틸리티로 클래스 병합.

# 보안 요구사항

PRD에 아래 보안 사항을 반드시 명시하세요:

1. **XSS 방지**: 사용자 입력값 및 API 응답 렌더링 시 React의 기본 이스케이핑에 의존. innerHTML 직접 조작 금지.
2. **입력 검증**: 클라이언트 사이드에서 이메일 형식, 사용자명 길이, 비밀번호 최소 길이 검증. 서버 사이드 검증에도 의존 (이중 검증).
3. **JWT 토큰 관리**: `authFetch` 패턴 구현. 토큰 자동 갱신, 만료 시 로그인 리다이렉트.
4. **자기 보호**: 자기 자신의 관리자 계정 삭제 방지. API 403 에러 + 프론트엔드 UI에서도 자기 자신의 삭제 버튼 비활성화 또는 숨김.
5. **전송 중복 방지**: 폼 제출 중 제출 버튼 비활성화로 중복 요청 방지.

# 출력 형식

아래 구조를 따라 PRD를 작성하세요. 각 섹션은 반드시 포함되어야 합니다.

## PRD 구조

1. **개요**: 프로젝트 기본 정보 테이블 (앱 이름, 앱 위치, 기술 스택, 디자인 테마, 색상, Gateway, 인증 방식, UI 언어). 기존 사용자 앱과의 관계(독립 앱) 명시
2. **API 연동**: Auth API 관리자 엔드포인트 전체 목록 (6개: 로그인, CRUD, 삭제) + 토큰 갱신 + 로그아웃. 각 API의 요청 파라미터, 응답 필드, 에러 코드 정리. 공통 응답 형식(ApiResponse<T>) 명시
3. **페이지 구조**: 페이지 목록과 각 페이지의 ASCII 와이어프레임
   - `/signin` — 관리자 로그인
   - `/` — 관리자 대시보드 (관리자 계정 관리로의 네비게이션)
   - `/accounts` — 관리자 계정 관리 (목록 + CRUD)
4. **컴포넌트 상세**:
   - 헤더: 앱 타이틀, 네비게이션, 사용자 정보, 로그아웃 버튼
   - 로그인 폼: Email/Password 입력, 유효성 검증 규칙, 에러 메시지 표시 방식
   - 관리자 계정 테이블: 컬럼 구성, 행별 액션, Empty State
   - 계정 생성 다이얼로그/폼: 입력 필드, 유효성 검증, 에러 표시
   - 계정 수정 다이얼로그/폼: 수정 가능 필드, 유효성 검증
   - 계정 삭제 확인 다이얼로그: 대상 정보 표시, 확인/취소 버튼
   - 토스트 알림: 성공/에러 피드백
5. **디자인 가이드**: 기존 사용자 앱과 일관된 Neo-Brutalism 스타일 적용 규칙. globals.css 디자인 토큰 및 유틸리티 클래스 명세. 로그인 페이지 레이아웃 (중앙 정렬 폼 카드). 테이블 스타일. 다이얼로그 스타일. 색상 팔레트, 폰트, 간격 규칙
6. **보안 사항**: XSS 방지 규칙, 입력 검증 규칙, JWT 토큰 관리, 자기 보호 로직, 중복 전송 방지
7. **기술 구현 사항**: 전체 디렉토리/파일 구조 (위 디렉토리 구조 참조). package.json 주요 의존성. next.config.ts API 프록시 설정. API 클라이언트 구현 방식 (`authFetch` + `parseResponse` 패턴). 인증 Context 구현 방식. 상태 관리 방향 (React useState/useCallback + Context API). 독립 실행 설정 (포트, 실행 명령)
8. **접근성**: 폼 필드 `label` 연결, 에러 메시지 `aria-live`, 테이블 `role`/`aria-label`, 키보드 네비게이션, 다이얼로그 포커스 트랩
9. **범위 제한**: 포함/미포함 항목 명시

# 제약 조건

- API 스펙에 정의된 필드명, 파라미터명을 그대로 사용한다. 임의로 변경하지 않는다. 특히: id, email, username, role, isActive, createdAt, lastLoginAt.
- API Gateway(8081)로 일괄 요청한다. 개별 서비스 포트(8083)로 직접 요청하지 않는다. Next.js rewrites `/api/*` → `http://localhost:8081/api/*` 프록시를 활용한다.
- 기존 사용자 앱(`/app`)의 디자인 시스템(Neo-Brutalism, 색상, 폰트, 유틸리티 클래스)을 그대로 따른다. Admin App이 기존 앱과 시각적으로 이질감 없이 일관되어야 한다.
- 기존 앱과 동일한 컴포넌트 라이브러리(Radix UI, CVA, Lucide 아이콘)를 활용한다. 새로운 UI 라이브러리를 추가하지 않는다.
- 기존 앱과 동일한 API 통신 패턴(authFetch, parseResponse, parseVoidResponse, AuthError)을 Admin App에서도 동일하게 구현한다.
- 기존 앱과 동일한 인증 상태 관리 패턴(AuthContext, useAuth, localStorage 기반)을 따른다.
- 화면에 표시되는 모든 텍스트(버튼, 라벨, 메시지, 플레이스홀더 등)는 영문을 사용한다.
- 오버엔지니어링하지 않는다. 요구사항에 명시되지 않은 기능(다크 모드, 다국어, 역할 기반 접근 제어 세분화, 감사 로그 UI, 대시보드 차트/통계, 실시간 알림 등)을 추가하지 않는다.
- Admin App은 기존 앱과 코드를 공유하지 않는 독립 프로젝트이다. 모노레포 설정, 공유 패키지 추출 등 불필요한 인프라를 추가하지 않는다.
- 관리자 목록 API(`GET /api/v1/auth/admin/accounts`)는 페이지네이션 없이 전체 목록을 반환한다. 클라이언트 사이드 페이지네이션이나 무한 스크롤을 추가하지 않는다.
- 비밀번호 정책(최소 8자)을 API 스펙 그대로 적용한다.
```

---

## 프롬프트 엔지니어링 기법 설명

| 기법 | 적용 위치 | 설명 |
|------|----------|------|
| Role Prompting | `# 역할` | LLM에 시니어 PM + 관리자 대시보드 전문가 + 클린 코드 전문가 역할을 부여하여 도메인 전문성 유도 |
| Structured Input | `<api-spec>` 태그 | API 설계서를 명확한 경계로 구분하여 제공 |
| Grounding | `# 참조: 기존 앱 코드베이스 컨텍스트` | 실제 구현된 코드 구조, 인증 인프라, API 패턴을 코드 스니펫과 함께 명시하여 기존 패턴과의 일관성 확보 |
| Explicit Output Format | `# 출력 형식` > `## PRD 구조` | 9개 섹션 구조를 번호로 지정하여 누락 방지 |
| Few-shot Context | `# 기능 요구사항` F1~F9 | 9개 기능을 코드 번호로 나열, 각 기능에 사용 API와 필드를 명시하여 모호성 제거 |
| Constraint Specification | `# 제약 조건` | 오버엔지니어링 방지, 독립 프로젝트 원칙, 디자인 일관성, API 스펙 준수를 선언 |
| Context Anchoring | `# 프로젝트 기본 정보` | 기술 스택, 색상 코드, Gateway, 인증 방식 등 사실 기반 정보를 고정값으로 제공 |
| Chain-of-Reference | `## API 클라이언트 패턴`, `## 인증 인프라 패턴` | 기존 코드의 실제 패턴을 코드 스니펫으로 보여주어 LLM이 동일 패턴으로 구현하도록 유도 |
| Domain-Specific Best Practices | `# 관리자 대시보드 UI/UX 베스트 프랙티스 가이드` | 테이블 UI, 폼 UI, 확인 다이얼로그, 네비게이션 등 관리자 대시보드 특화 UI/UX 패턴을 15개 항목으로 구분하여 PRD에 반영 유도 |
| Security Specification | `# 보안 요구사항` | XSS 방지, JWT 관리, 자기 보호 로직 등 보안 사항을 별도 섹션으로 분리하여 PRD에 반드시 포함되도록 강제 |
| Negative Constraint | `# 제약 조건` 후반부 | '하지 말아야 할 것'(오버엔지니어링, 모노레포, 불필요 기능)을 명시하여 잘못된 확장 방지 |
| Design Consistency Anchoring | `# 독립 앱 설계 원칙`, `# 베스트 프랙티스` 14~15항, `# 제약 조건` 3~6항 | 독립 프로젝트이면서도 기존 앱과의 디자인/패턴 일관성을 다중 위치에서 반복 강조하여 이탈 방지 |
| Independence-Consistency Balance | `# 독립 앱 설계 원칙` | 독립성 요구사항과 일관성 요구사항을 명확히 분리하여 "독립이지만 일관된" 설계 방향을 구조적으로 제시 |
