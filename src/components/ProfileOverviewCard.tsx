import ProfileSummaryCard from './ProfileSummaryCard'
import StatBarSection from './StatBarSection'
import type { ProfileSummary, StatItem } from '../types/MyPage.types'

interface ProfileOverviewCardProps {
  profile: ProfileSummary
  projectTypeStats: StatItem[]
  roleStats: StatItem[]
  onEditClick: () => void
}

function ProfileOverviewCard({
  profile,
  projectTypeStats,
  roleStats,
  onEditClick,
}: ProfileOverviewCardProps) {
  return (
    <section className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-xs lg:flex-row lg:gap-0">
      {/* 프로필 영역 — 절반 */}
      <div className="lg:w-1/2 lg:pr-6">
        <ProfileSummaryCard profile={profile} onEditClick={onEditClick} />
      </div>

      {/* 통계 영역 — 절반, 사이에만 세로선 */}
      <div className="flex flex-col gap-8 border-t border-[#A3A3A3] pt-6 lg:w-1/2 lg:flex-row lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <div className="flex-1">
          <StatBarSection title="많이 한 프로젝트 유형" items={projectTypeStats} />
        </div>
        <div className="flex-1">
          <StatBarSection title="많이 한 역할" items={roleStats} />
        </div>
      </div>
    </section>
  )
}

export default ProfileOverviewCard
