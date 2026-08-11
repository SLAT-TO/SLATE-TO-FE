import { request } from './client'
import { normalizeMe, type BeMe } from './normalize'
import { paths } from './paths'
import type {
  ChangePasswordRequest,
  DeleteAccountRequest,
  MeProfile,
  NotificationSettings,
  OnboardingRequest,
  OnboardingResult,
  PublicUser,
  UpdateProfileRequest,
  UserActivityStats,
} from '../types/user'
import type {
  CreatePortfolioRequest,
  PageResult,
  Portfolio,
  UpdatePortfolioRequest,
} from '../types/portfolio'

export async function getMe(): Promise<MeProfile> {
  const result = await request<BeMe>({ method: 'GET', url: paths.users.me })
  return normalizeMe(result)
}

export async function getMyActivityStats(): Promise<UserActivityStats> {
  return request<UserActivityStats>({ method: 'GET', url: paths.users.activityStats })
}

export async function getUserStats(userId: number): Promise<UserActivityStats> {
  return request({ method: 'GET', url: paths.users.stats(userId) })
}

export async function submitOnboarding(body: OnboardingRequest): Promise<OnboardingResult> {
  return request<OnboardingResult>({
    method: 'POST',
    url: paths.users.onboarding,
    data: body,
  })
}

export async function updateProfile(body: UpdateProfileRequest): Promise<MeProfile> {
  const result = await request<BeMe>({ method: 'PATCH', url: paths.users.me, data: body })
  return normalizeMe(result)
}

/** PUT /users/me/profile-image — 프로필 이미지를 S3에 업로드하고 CDN 공개 URL로 교체 */
export async function uploadProfileImage(
  file: File,
): Promise<{ profileImageUrl: string; updatedAt: string }> {
  const formData = new FormData()
  formData.append('file', file)
  // apiClient 기본 Content-Type이 application/json이라, 여기서 명시적으로 undefined로
  // 지워야 axios가 FormData를 JSON으로 오인해 직렬화하지 않고 브라우저가 boundary를
  // 포함한 multipart/form-data 값을 자동으로 채우게 둔다.
  return request({
    method: 'PUT',
    url: paths.users.profileImage,
    data: formData,
    headers: { 'Content-Type': undefined },
  })
}

/** FE mock 전용 — BE에 DELETE /users/me(회원탈퇴) 미구현. BE 연동 시 API 존재 여부 재확인 필요 */
export async function deleteAccount(body: DeleteAccountRequest): Promise<null> {
  return request<null>({ method: 'DELETE', url: paths.users.me, data: body })
}

export async function changePassword(body: ChangePasswordRequest): Promise<null> {
  return request<null>({ method: 'PATCH', url: paths.users.changePassword, data: body })
}

export async function getPublicProfile(userId: number): Promise<PublicUser> {
  return request<PublicUser>({ method: 'GET', url: paths.users.byId(userId) })
}

export async function getUserPortfolios(
  userId: number,
  params: { cursor?: number; size?: number } = {},
): Promise<PageResult<Portfolio>> {
  return request<PageResult<Portfolio>>({
    method: 'GET',
    url: paths.users.portfolios(userId),
    params,
  })
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return request<NotificationSettings>({
    method: 'GET',
    url: paths.users.notificationSettings,
  })
}

export async function updateNotificationSettings(
  body: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  return request<NotificationSettings>({
    method: 'PATCH',
    url: paths.users.notificationSettings,
    data: body,
  })
}

export async function createPortfolio(body: CreatePortfolioRequest): Promise<Portfolio> {
  return request<Portfolio>({ method: 'POST', url: paths.users.myPortfolios, data: body })
}

export async function getMyPortfolio(portfolioId: number): Promise<Portfolio> {
  return request<Portfolio>({ method: 'GET', url: paths.users.myPortfolio(portfolioId) })
}

export async function updatePortfolio(
  portfolioId: number,
  body: UpdatePortfolioRequest,
): Promise<Portfolio> {
  return request<Portfolio>({
    method: 'PATCH',
    url: paths.users.myPortfolio(portfolioId),
    data: body,
  })
}

export async function deletePortfolio(portfolioId: number): Promise<null> {
  return request<null>({ method: 'DELETE', url: paths.users.myPortfolio(portfolioId) })
}
