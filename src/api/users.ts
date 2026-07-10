import { request } from './client'
import { paths } from './paths'
import type {
  MeUser,
  NotificationSettings,
  OnboardingRequest,
  OnboardingResult,
  PublicUser,
  UpdateProfileRequest,
} from '../types/user'
import type {
  CreatePortfolioRequest,
  PageResult,
  Portfolio,
  UpdatePortfolioRequest,
} from '../types/portfolio'

export async function getMe(): Promise<MeUser> {
  return request<MeUser>({ method: 'GET', url: paths.users.me })
}

export async function submitOnboarding(body: OnboardingRequest): Promise<OnboardingResult> {
  return request<OnboardingResult>({
    method: 'POST',
    url: paths.users.onboarding,
    data: body,
  })
}

export async function updateProfile(body: UpdateProfileRequest): Promise<MeUser> {
  return request<MeUser>({ method: 'PATCH', url: paths.users.me, data: body })
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
