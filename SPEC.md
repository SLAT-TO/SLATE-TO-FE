# SLATE-TO FE 기능 명세서

> 2차 과제 제출용 명세서. 팀 전반 컨벤션(브랜치·커밋·PR 등)은 [README.md](README.md) 참고.

## 프로젝트 소개

SLATE-TO는 영상 제작자들이 구인구직, 프로젝트 관리, 팀 협업을 한 곳에서 처리할 수 있는 워크스페이스 서비스입니다. 핵심 기능은 ① 구인구직(공고 등록·지원·나의 구인구직 관리), ② 프로젝트 워크스페이스(일정·파일·영상 피드백·공지), ③ 온보딩·마이페이지·알림입니다.

## 배포 주소

https://slate-to-fe.vercel.app

## 화면 목록 · 라우팅 구조 · 담당자

라우팅은 React Router가 아니라 `usePathname` + `matchPath` 임시 골격입니다 (`src/utils/navigation.ts`). `MainLayout`(사이드바·헤더)로 감싸는 일반 라우트는 `src/App.tsx`의 `AppRoutes`에, 레이아웃 없이 전체 화면을 쓰는 라우트는 `src/routes/fullscreen/routes.tsx`에 등록됩니다.

### 풀스크린 라우트 (레이아웃 없음)

| 화면        | Route Path                    | Page Component     | 담당자 |
| ----------- | ----------------------------- | ------------------ | ------ |
| 랜딩        | `/landing`                    | `LandingPage`      | 디아   |
| 로그인      | `/login`                      | `LoginPage`        | 디아   |
| 회원가입    | `/signup`                     | `SignupPage`       | 디아   |
| 이메일 인증 | `/signup/email-verification`  | `EmailVerifyPage`  | 디아   |
| 약관 동의   | `/signup/terms`               | `TermsPage`        | 디아   |
| 초대 수락   | `/project-invitations/:token` | `InviteAcceptPage` | 디아   |
| 온보딩      | `/onboarding`                 | `OnboardingPage`   | 이브   |

### 일반 라우트 (MainLayout: 사이드바 + 헤더)

| 화면               | Route Path                       | Page Component                      | 담당자 |
| ------------------ | -------------------------------- | ----------------------------------- | ------ |
| 홈                 | `/`                              | `HomePage`                          | 이브   |
| 통합 캘린더        | `/calendar`                      | `CalendarPage`                      | 이브   |
| 알림               | `/notifications`                 | `NotificationPage`                  | 이브   |
| 구인구직 목록      | `/matching`                      | `RecruitPage`                       | 재희   |
| 구인구직 상세      | `/matching/:jobId`               | `JobDetailPage`                     | 재희   |
| 지원자 목록        | `/matching/:jobId/applicants`    | `JobApplicantsPage`                 | 재희   |
| 나의 구인구직      | `/matching/my`                   | `MyRecruitPage`                     | 재희   |
| 공고 작성          | `/matching/new`                  | `JobFormPage`                       | 재희   |
| 워크스페이스(목록) | `/workspace`                     | `WorkspacePage`                     | 클레버 |
| 프로젝트 상세      | `/workspace/projects/:projectId` | `ProjectDetailPage`                 | 클레버 |
| 마이페이지         | `/mypage`                        | `MyPage`                            | 재희   |
| 프로필 수정        | `/mypage/edit`                   | `ProfileEditPage`                   | 재희   |
| 프로젝트 추가      | `/mypage/project/new`            | `ProjectFormPage` (`mode="create"`) | 재희   |
| 프로젝트 수정      | `/mypage/project/:id/edit`       | `ProjectFormPage` (`mode="edit"`)   | 재희   |
| 프로젝트 개요      | `/mypage/project/:id`            | `ProjectOverviewPage`               | 재희   |
| 설정               | `/settings`                      | `SettingsPage`                      | 클레버 |
| 설정 - 알림        | `/settings/notifications`        | `SettingsNotificationsPage`         | 클레버 |
| 설정 - 비밀번호    | `/settings/password`             | `SettingsPasswordPage`              | 클레버 |
| 설정 - 문의        | `/settings/inquiry`              | `SettingsInquiryPage`               | 클레버 |

> **프로젝트 상세**(`ProjectDetailPage`)는 별도 라우트 대신 탭(대시보드·일정·파일·피드백)으로 내부 전환됩니다. 탭 상태는 `App.tsx`에서 `<ProjectDetailPage key={projectId} />`로 프로젝트 전환 시 컴포넌트를 리마운트시켜 리셋합니다.
>
> 매칭되는 라우트가 없으면 "화면은 아직 없습니다" placeholder가 렌더링됩니다(`AppRoutes` 마지막 분기).

## 공통 컴포넌트

| 컴포넌트                                                                                                                          | 설명                            | 담당자 |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------ |
| `Button`                                                                                                                          | 공통 버튼 (variant/size)        | 이브   |
| `Input`                                                                                                                           | 문자열 입력                     | 디아   |
| `TextArea`                                                                                                                        | 여러 줄 문자열 입력             | 클레버 |
| `Select`                                                                                                                          | 드롭다운 단일 선택              | 클레버 |
| `Choice`                                                                                                                          | 단일 checkbox / radio           | 클레버 |
| `FileInput`                                                                                                                       | 파일 선택·업로드                | 디아   |
| `Switch`                                                                                                                          | boolean ON/OFF 토글             | 이브   |
| `ActionMenu`                                                                                                                      | 트리거 + 액션 목록 드롭다운     | 클레버 |
| `Tabs`                                                                                                                            | 콘텐츠 탭                       | 재희   |
| `Modal` / `ConfirmModal`                                                                                                          | 모달 껍데기 · 확인 모달         | 재희   |
| `ProgressBar`                                                                                                                     | 진행률 바                       | 재희   |
| `Avatar`                                                                                                                          | 프로필 이미지                   | 이브   |
| `Tag`                                                                                                                             | 라벨/뱃지                       | 디아   |
| `Calendar` / `CalendarGrid` / `DateSingleField` / `DateRangeField` / `DateSingleCalendar` / `DateRangeCalendar` / `EventBarLayer` | 캘린더 및 날짜 선택 계열        | 이브   |
| `YouTubeIframePlayer` / `VideoPreview`                                                                                            | 영상 재생·미리보기(oEmbed)      | 클레버 |
| `Header` / `HeaderTitle` / `HeaderProfileMenu` / `Sidebar`                                                                        | 전역 레이아웃                   | 재희   |
| `JobCard`                                                                                                                         | 구인구직 카드 (도메인 컴포넌트) | 재희   |
| `InlineIcon`                                                                                                                      | SVG 아이콘 래퍼                 | 공통   |

## 데이터 관리 (Mock / API 연동)

- **API 클라이언트**: `src/api/client.ts` — axios 인스턴스(`apiClient`) + `request()`/`requestBlob()` 공통 래퍼. 응답의 `isSuccess` 래핑을 해제하고 실패 시 `ApiError`로 통일.
- **Mock**: `src/mocks/` — MSW(`msw/browser`)로 `/api/v1/*` 요청을 가로챕니다. `db.ts`가 인메모리 시드 데이터(유저 3명, 프로젝트, 공고 등)를 보유하며 앱 로드 시 이미 로그인된 상태(`completeUser`)로 초기화됩니다.
- **환경변수**로 모드 전환: `VITE_ENABLE_MSW`(mock on/off), `VITE_API_BASE_URL`(원격 BE 직결 시). 로컬 BE 연동은 Vite proxy(`/api` → `localhost:8080`) 예정.
- **정합 상태**: `src/api/*.ts`의 함수/타입은 실 BE Swagger 기준으로 순차 정렬 중(`feat/kcleverp-mock-swagger-sync`, PR #149 — 아직 `dev` 미병합, API 연동 시점에 함께 처리 예정).
- 대부분의 페이지는 API 함수를 직접 호출해 mock 데이터를 받아오며, 일부(구인구직 상세/지원자 등 `src/domains/recruit/mockJobDetail.ts` 등)는 컴포넌트 로컬 mock 상수를 사용합니다.

## 상태 관리

- **로컬 상태**: 대부분의 화면은 `useState`/`useEffect` 기반.
- **전역 상태(Zustand)**: `src/stores/calendarStore.ts`(캘린더 필터·이벤트), `src/stores/onboardingStore.ts`(온보딩 단계별 선택값 — 단, 아래 트러블슈팅 참고).
- **폼 검증**: Zod 스키마(`src/schemas/`)로 제출 시점 검증.
- **인증 토큰**: `localStorage`(`src/api/client.ts`의 `getAccessToken`/`setAccessToken`) — mock 환경에서는 앱 시작 시 자동 주입.

## 트러블슈팅 기록

| 문제 상황                                                                                                                        | 발생 시점                            | 담당자      | 원인                                                                                                                                                                                                                                                     | 해결 여부               | 해결 방법                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `App.tsx` trailing-slash 정규화가 일부 라우트에만 적용돼 `/mypage/`처럼 슬래시가 붙으면 "준비 중" 화면으로 빠짐                  | PR #103 리뷰                         | 클레버      | 정규화 로직(`path` 변수)을 도입하면서 일부 `pathname` 비교 분기를 놓쳐 raw `pathname`과 정규화된 `path`가 혼용됨                                                                                                                                         | 해결                    | 모든 경로 비교를 `path` 기준으로 통일                                                                                                                          |
| 프로젝트 파일 업로드(`uploadProjectFile`)가 `Content-Type: 'multipart/form-data'`를 직접 지정해 boundary 누락 → 업로드 실패 위험 | PR #149 리뷰                         | 클레버      | axios가 FormData를 보낼 때 boundary를 자동 부여하는데, Content-Type을 수동으로 고정하면 이 자동화가 깨짐(더 나아가 axios 인스턴스 기본값이 `application/json`이면 FormData가 JSON으로 변환돼버림)                                                        | **미해결(의도적 보류)** | 원인·수정 방법은 확인 완료. `uploadProjectFile`이 아직 `dev`에 없는 PR #149 전용 코드라 지금 배포본엔 영향 없어, 실 BE 연동 시점에 함께 반영 예정              |
| 헤더 프로필 메뉴 "나의 구인구직"이 `/matching`(추천공고)으로 잘못 연결                                                           | PR #144 이후                         | 재희/클레버 | "나의 구인구직" 전용 페이지(#141)가 나중에 만들어지면서 임시 링크(#140)를 교체하지 않음                                                                                                                                                                  | 해결                    | `/matching/my`로 링크 수정 (PR #152)                                                                                                                           |
| 온보딩을 끝까지 진행해도 아무 화면으로도 이동하지 않고 멈춤                                                                      | 로그인 버튼 연결 작업 중 발견        | 클레버      | `OnboardingPage`의 `onComplete` prop이 라우트 등록(`fullscreenRoutes.tsx`)에서 전달되지 않아 완료 시 콜백이 no-op                                                                                                                                        | 해결                    | `fullscreenRoutes.tsx`에서 `onComplete={() => navigate('/')}` 연결                                                                                             |
| 로그인 페이지 "구글 로그인" 버튼 클릭이 무반응                                                                                   | 로그인 버튼 연결 작업 중 발견        | 클레버      | `onClick` 자체가 비어 있어 기존에 만들어진 `startGoogleLogin()`이 호출되지 않음                                                                                                                                                                          | 해결                    | 버튼에 `startGoogleLogin()` 연결 (PR #153)                                                                                                                     |
| (위 수정 직후) 실제 브라우저로 클릭까지 재현하니 `/api/v1/auth/login/google` 요청이 502로 실패하고 멈춤                          | PR #153 검증(Playwright) 중 발견     | 클레버      | `startGoogleLogin`이 `window.location.href`로 최상위 브라우저 내비게이션을 트리거하는데, MSW 서비스워커가 이런 top-level navigation은 안정적으로 가로채지 못함(fetch/XHR만 확실히 인터셉트) — 다른 `/api/v1/*` mock 엔드포인트로 직접 이동해도 동일 재현 | 해결                    | `VITE_ENABLE_MSW=true`일 때는 `fetch(redirect:'follow')`로 302를 직접 따라가 SPA 라우터로 이동시키고, 실 BE 연동 시엔 기존처럼 `location.href` 사용하도록 분기 |
| 온보딩에서 역할·지역·카테고리·프로필을 선택해도 홈 등 이후 화면에 반영되지 않음                                                  | 로그인→온보딩→홈 플로우 점검 중 발견 | 클레버      | `ProfileStep`이 API 호출 없이 로컬 상태(`useOnboardingStore`)만 채우고 바로 `onComplete()`를 호출 — 서버에 전송하는 로직 자체가 없음                                                                                                                     | **미해결(의도적 보류)** | 체험용 UI 플로우로는 동작하나 실제 데이터 반영은 BE 연동 후 작업 예정. README에 한계 명시                                                                      |

## 알려진 제약 (2차 과제 시점)

- 로그인 화면의 이메일/비밀번호 폼은 UI만 구현되어 있고 제출 로직은 없음(`onSubmit`이 `preventDefault()`만 수행). 구글 로그인(mock)만 실제로 동작.
- 카카오 로그인은 mock 엔드포인트가 없어 버튼이 아직 연결되지 않음.
- `/auth/callback` 페이지가 없어, mock 구글 로그인은 `redirectTo`로 곧바로 온보딩/워크스페이스 등 특정 경로로 보냄(실제 토큰 교환 콜백 처리는 BE 연동 후 구현 예정).
- 프로젝트 파일 업로드의 Content-Type 이슈(위 트러블슈팅 참고)는 BE 연동 시 함께 수정 예정.
