import type { ProfileSummary } from '../../types/MyPage.types'
import Tag from '../../components/Tag'

interface ProfileSummaryCardProps {
  profile: ProfileSummary
  onEditClick?: () => void
}

/** 카드 공간이 좁아 앞의 2개만 노출하고 나머지는 개수로 표시 */
const VISIBLE_COUNT = 2

function ProfileSummaryCard({ profile, onEditClick }: ProfileSummaryCardProps) {
  const { profileImageUrl, nickname, roles, regions, email, introduction } = profile

  const visibleRoles = roles.slice(0, VISIBLE_COUNT)
  const hiddenRoleCount = roles.length - visibleRoles.length
  const visibleRegions = regions.slice(0, VISIBLE_COUNT)
  const hiddenRegionCount = regions.length - visibleRegions.length

  return (
    <div className="flex items-start gap-4">
      <img
        src={profileImageUrl}
        alt={`${nickname}님의 프로필 사진`}
        className="h-16 w-16 shrink-0 rounded-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-11 text-lg font-semibold">{nickname}</span>
            {visibleRoles.map((role) => (
              <Tag key={role}>{role}</Tag>
            ))}
            {hiddenRoleCount > 0 && (
              <span className="text-neutral-6 text-xs">+{hiddenRoleCount}</span>
            )}
          </div>
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="border-border text-neutral-8 hover:bg-neutral-1 shrink-0 rounded-md border px-3 py-1.5 text-xs font-normal transition-colors"
            >
              수정하기
            </button>
          )}
        </div>

        {visibleRegions.length > 0 && (
          <span className="text-neutral-7 text-sm">
            {visibleRegions.join(', ')}
            {hiddenRegionCount > 0 && <span className="text-neutral-6"> +{hiddenRegionCount}</span>}
          </span>
        )}

        <span className="text-neutral-7 text-sm">{email}</span>
        <p className="text-neutral-8 mt-2 text-sm leading-relaxed whitespace-pre-line">
          {introduction?.trim() ? (
            introduction
          ) : (
            <span className="text-neutral-5">한 줄 자기소개를 입력해주세요.</span>
          )}
        </p>
      </div>
    </div>
  )
}

export default ProfileSummaryCard
