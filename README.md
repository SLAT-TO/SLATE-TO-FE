# SLATE-TO FE

> 영상 제작자를 위한 협업 워크스페이스 프론트엔드입니다.

## 기술 스택

| 구분         | 사용 기술                      |
| ------------ | ------------------------------ |
| Framework    | React 19, TypeScript 6, Vite 8 |
| Routing      | React Router                   |
| Server state | TanStack Query                 |
| Client state | Zustand                        |
| Styling      | Tailwind CSS 4                 |
| HTTP         | Axios                          |
| Validation   | Zod                            |
| Mock         | MSW 2                          |
| Date         | date-fns                       |
| Quality      | ESLint, Prettier               |
| Deploy       | Vercel                         |

정확한 버전은 [package.json](./package.json)을 기준으로 합니다.

## 주요 기능

- 이메일·Google 로그인 및 회원가입
- 약관 동의와 프로필 온보딩
- 프로젝트 생성·관리, 일정, 공지, 파일, 영상 피드백
- 구인구직 공고와 공개 프로필
- 마이페이지와 계정 설정

## 폴더 구조

```text
src/
├── api/          # API client, endpoint paths, 요청·응답 변환
├── assets/       # 이미지, 아이콘, 폰트
├── components/   # 여러 도메인에서 쓰는 공용 UI
├── constants/    # 상태 라벨, 카테고리 등 상수
├── domains/      # 도메인별 UI와 기능 묶음
├── hooks/        # 공용 커스텀 훅
├── layouts/      # 공용 레이아웃
├── mocks/        # MSW browser worker와 handlers
├── pages/        # 페이지 단위 화면
├── queries/      # TanStack Query key, query, mutation
├── routes/       # React Router route 조각과 bridge
├── schemas/      # Zod schema
├── stores/       # Zustand store
├── styles/       # 공용 스타일 조합
├── types/        # 도메인 타입
└── utils/        # 순수 유틸리티
```

## 라우팅

앱은 `BrowserRouter`와 `Routes`를 사용합니다.

- 워크스페이스 경로는 `src/routes/workspace`에서 선언적으로 관리합니다.
- 전체 화면 진입 경로는 `src/routes/fullscreen`에서 관리합니다.
- 일부 기존 화면은 `App.tsx`의 레거시 분기와 `NavigateBridge`를 통해 React Router와 함께 동작합니다.

새 경로는 가능한 한 `routes/`에 추가하고, 기존 `navigate()` 헬퍼를 사용할 때에도 Router 상태와 URL 상태가 함께 갱신되는지 확인합니다.

## 로컬 실행

CI 기준 Node.js 버전은 20입니다.

```bash
npm ci
npm run dev
```

### 품질 확인

```bash
npm run lint
npm run format:check
npm run build
```

자동 포맷은 `npm run format`을 사용합니다.

## API·MSW 환경 설정

`.env.example`을 복사해 `.env.local`을 만들고 목적에 맞게 설정합니다.

| 목적              | `VITE_ENABLE_MSW` | `VITE_API_BASE_URL` | 설명                                                                 |
| ----------------- | ----------------- | ------------------- | -------------------------------------------------------------------- |
| 로컬 mock         | `true`            | 비움                | MSW가 `/api/v1` 요청을 가로챕니다.                                   |
| 로컬 BE proxy     | `false`           | 비움                | Vite dev server가 `/api`를 API 서버로 proxy합니다.                   |
| 원격 BE 직접 연결 | `false`           | API origin          | 브라우저가 API origin으로 직접 요청하므로 BE CORS 설정이 필요합니다. |

Vercel Preview·Production의 값은 저장소 파일이 아니라 Vercel 프로젝트 환경 변수에서 관리합니다. 실제 BE를 연결할 배포에서는 MSW를 끄고, 해당 배포 환경에 맞는 API base URL을 설정해야 합니다.

## 인증과 온보딩

- 실제 BE 모드에서 소셜 로그인은 인증 콜백 후 사용자 상태를 조회해 홈 또는 온보딩으로 이동합니다.
- 프로필 단계는 `POST /api/v1/users/onboarding`으로 닉네임, 역할, 지역, 카테고리, 소개, 약관 동의 값을 전송합니다.
- 프로필 이미지는 별도 업로드 흐름을 통해 처리한 뒤, 서버가 사용할 수 있는 URL만 온보딩 요청에 포함합니다.
- MSW 모드에서는 위 흐름을 mock handler가 대체합니다.

## 협업 규칙

### 브랜치

`dev`에서 작업 단위별 브랜치를 생성합니다.

```text
feature/{작성자}-{기능}
fix/{작성자}-{수정}
refactor/{작성자}-{대상}
docs/{작성자}-{문서}
```

### 이슈와 커밋

모든 변경은 먼저 GitHub 이슈로 기록합니다. 커밋 제목에는 이슈 번호를 포함하고, 별도의 trailer는 사용하지 않습니다.

```text
type: 작업 내용 (#이슈번호)
```

예시:

```text
fix: 파일 업로드 제한을 수정 (#307)
```

`type`은 `feat`, `fix`, `refactor`, `style`, `chore`, `docs`를 사용합니다.

### Pull Request

- 기능·화면·문서 등 검토 가능한 단위로 PR을 나눕니다.
- 일반 작업 PR의 base는 `dev`입니다.
- 제목은 커밋 규칙과 같은 `type: 작업 내용 (#이슈번호)` 형식으로 작성합니다.
- 본문에는 PR 템플릿에 맞춰 `Closes #이슈번호`, 변경 사항, 스크린샷 필요 여부, 리뷰 포인트, 검증 항목을 작성합니다.
- `dev` 병합 뒤 통합 테스트를 진행하고, 배포 시점에만 `dev`를 `main`으로 병합합니다.

## 코드 작성 기준

- 컴포넌트와 폴더는 PascalCase, 함수·변수·훅은 camelCase를 사용합니다.
- 공용 UI는 `src/components`, 화면·도메인 전용 UI는 `src/domains`에 둡니다.
- 서버 데이터는 TanStack Query의 query key와 mutation을 통해 관리합니다.
- 입력 검증 규칙은 `src/schemas`에 두고, UI 컴포넌트에는 오류 메시지만 전달합니다.
- 새 코드에서는 semantic color token을 우선 사용합니다.
