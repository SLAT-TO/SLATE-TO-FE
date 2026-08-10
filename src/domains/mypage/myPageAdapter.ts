import type { MeProfile, UserActivityStats } from '../../types/user'
import type { Portfolio } from '../../types/portfolio'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../../types/MyPage.types'
import { roleLabel } from '../../constants/roles'
import { regionLabel } from '../../constants/regions'
import { videoCategoryLabel } from '../../constants/videoCategories'

/** 지역이 여러 개면 앞의 2개만 노출하고 나머지는 +N */
export function formatRegions(regions: (string | null)[]): string {
  const labels = regions.filter(Boolean).map((r) => regionLabel(r as string))
  if (labels.length === 0) return ''
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
}

export function toProfileSummary(me: MeProfile): ProfileSummary {
  return {
    profileImageUrl: me.profileImageUrl ?? 'https://placehold.co/64x64',
    nickname: me.nickname,
    role: me.primaryRole ? roleLabel(me.primaryRole) : '',
    region: formatRegions(me.regions),
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

export function toProjectHistoryItem(portfolio: Portfolio): ProjectHistoryItem {
  return {
    id: String(portfolio.id),
    title: portfolio.title,
    thumbnailUrl: portfolio.thumbnailUrl ?? 'https://placehold.co/300x160',
    tags: [videoCategoryLabel(portfolio.type), ...portfolio.roles.map((r) => roleLabel(r))],
  }
}
