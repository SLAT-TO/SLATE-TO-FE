import { useEffect, useState } from 'react'
import ProfileOverviewCard from '../domains/mypage/ProfileOverviewCard'
import ProjectHistoryCard from '../domains/mypage/ProjectHistoryCard'
import type { ProfileSummary, ProjectHistoryItem } from '../types/MyPage.types'
import type { PublicUser } from '../types/user'
import type { Portfolio } from '../types/portfolio'
import { getPublicProfile, getUserPortfolios } from '../api/users'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { roleLabel } from '../constants/roles'
import { regionLabel } from '../constants/regions'
import { PROJECT_TYPE_LABEL } from '../constants/projectLabels'
import { toProjectTypeStats, toRoleStats } from '../domains/mypage/myPageAdapter'

interface UserProfilePageProps {
  userId: number
}

const HEADER = <HeaderTitle>프로필</HeaderTitle>

/** 공개 프로필은 이메일이 비공개라 빈 값으로 둔다 */
function toProfileSummary(user: PublicUser): ProfileSummary {
  return {
    profileImageUrl: user.profileImageUrl ?? '',
    nickname: user.nickname,
    roles: user.roles.map((r) => roleLabel(r)),
    regions: user.locations.map((location) => regionLabel(location)),
    email: '',
    introduction: user.bio ?? '',
  }
}

function toProjectHistory(portfolio: Portfolio): ProjectHistoryItem {
  return {
    id: String(portfolio.id),
    title: portfolio.title,
    thumbnailUrl: portfolio.thumbnailUrl ?? '',
    tags: [PROJECT_TYPE_LABEL[portfolio.type] ?? portfolio.type, ...portfolio.roles.map(roleLabel)],
  }
}

function UserProfilePage({ userId }: UserProfilePageProps) {
  useHeaderSlot(HEADER)
  const [user, setUser] = useState<PublicUser | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [profile, portfolioPage] = await Promise.all([
          getPublicProfile(userId),
          getUserPortfolios(userId).catch(() => null),
        ])
        if (cancelled) return
        setUser(profile)
        setPortfolios(portfolioPage?.items ?? [])
      } catch {
        if (!cancelled) setError('프로필을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading) {
    return <p className="text-body-sm text-neutral-6 p-6">불러오는 중…</p>
  }

  if (error || !user) {
    return (
      <p className="text-body-sm text-neutral-6 p-6">{error ?? '프로필을 찾을 수 없습니다.'}</p>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProfileOverviewCard
        profile={toProfileSummary(user)}
        projectTypeStats={toProjectTypeStats(user.stats)}
        roleStats={toRoleStats(user.stats)}
      />

      <section>
        <h3 className="text-neutral-11 mb-4 text-base font-semibold">프로젝트 이력</h3>
        {portfolios.length === 0 ? (
          <p className="text-caption-sm text-neutral-6">등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {portfolios.map((portfolio) => (
              <ProjectHistoryCard key={portfolio.id} project={toProjectHistory(portfolio)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default UserProfilePage
