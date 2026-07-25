import { request } from './client'
import { normalizeMe } from './normalize'
import { paths } from './paths'
import type {
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
  const result = await request({ method: 'GET', url: paths.users.me })
  return normalizeMe(result)
}

export async function getMyActivityStats(): Promise<UserActivityStats> {
  return request<UserActivityStats>({ method: 'GET', url: paths.users.activityStats })
}

export async function submitOnboarding(body: OnboardingRequest): Promise<OnboardingResult> {
  return request<OnboardingResult>({
    method: 'POST',
    url: paths.users.onboarding,
    data: body,
  })
}

export async function updateProfile(body: UpdateProfileRequest): Promise<MeProfile> {
  const result = await request({ method: 'PATCH', url: paths.users.me, data: body })
  return normalizeMe(result)
}

export async function deleteAccount(agreed: boolean): Promise<null> {
  return request<null>({ method: 'DELETE', url: paths.users.me, data: { agreed } })
}

export async function getPublicProfile(userId: number): Promise<PublicUser> {
  return request<PublicUser>({ method: 'GET', url: paths.users.byId(userId) })
}

export async function getUserPortfolios(
  userId: number,
  page = 1,
  size = 12,
): Promise<PageResult<Portfolio>> {
  return request<PageResult<Portfolio>>({
    method: 'GET',
    url: paths.users.portfolios(userId),
    params: { page, size },
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
