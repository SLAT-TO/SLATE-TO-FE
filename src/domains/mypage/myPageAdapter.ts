import type { MeProfile, UserActivityStats } from '../../types/user'
import type { PortfolioSummary } from '../../types/portfolio'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../../types/MyPage.types'
import { roleLabel } from '../../constants/roles'
import { regionLabel } from '../../constants/regions'
import { videoCategoryLabel } from '../../constants/videoCategories'

export function toProfileSummary(me: MeProfile): ProfileSummary {
  return {
    profileImageUrl: me.profileImageUrl ?? 'https://placehold.co/64x64',
    nickname: me.nickname,
    roles: me.roles.map((r) => roleLabel(r)),
    regions: me.regions.map((r) => regionLabel(r as string)),
    email: me.email,
    introduction: me.bio ?? '',
  }
}

/** 막대 길이는 목록 내 최댓값 기준 (없으면 1로 0 나눗셈 방지) */
function toStatItems(entries: Array<{ label: string; count: number }>): StatItem[] {
  const max = Math.max(1, ...entries.map((e) => e.count))
  return entries.map((e) => ({ label: e.label, value: e.count, max }))
}

export function toProjectTypeStats(stats: UserActivityStats): StatItem[] {
  return toStatItems(
    stats.projectTypes.map((s) => ({
      label: s.label ?? videoCategoryLabel(s.type),
      count: s.count,
    })),
  )
}

export function toRoleStats(stats: UserActivityStats): StatItem[] {
  return toStatItems(
    stats.roles.map((s) => ({
      label: s.label ?? roleLabel(s.role),
      count: s.count,
    })),
  )
}

export function toProjectHistoryItem(portfolio: PortfolioSummary): ProjectHistoryItem {
  return {
    id: String(portfolio.id),
    title: portfolio.title,
    thumbnailUrl: portfolio.thumbnailUrl ?? 'https://placehold.co/300x160',
    tags: [videoCategoryLabel(portfolio.type), ...portfolio.roles.map((r) => roleLabel(r))],
  }
}
