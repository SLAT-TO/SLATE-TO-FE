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
    <section className="border-border bg-surface lg:divide-border flex flex-col gap-6 rounded-xl border p-6 lg:flex-row lg:gap-0 lg:divide-x">
      <div className="lg:w-1/2 lg:pr-6">
        <ProfileSummaryCard profile={profile} onEditClick={onEditClick} />
      </div>
      <div className="border-border border-t pt-6 lg:w-1/4 lg:border-t-0 lg:px-6 lg:pt-0">
        <StatBarSection title="많이 한 프로젝트 유형" items={projectTypeStats} />
      </div>
      <div className="border-border border-t pt-6 lg:w-1/4 lg:border-t-0 lg:pt-0 lg:pl-6">
        <StatBarSection title="많이 한 역할" items={roleStats} />
      </div>
    </section>
  )
}

export default ProfileOverviewCard
