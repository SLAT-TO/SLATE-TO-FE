import type { ProfileSummary } from '../../types/MyPage.types'
import Tag from '../../components/Tag'

interface ProfileSummaryCardProps {
  profile: ProfileSummary
  onEditClick?: () => void
}

function ProfileSummaryCard({ profile, onEditClick }: ProfileSummaryCardProps) {
  const { profileImageUrl, nickname, role, region, email, introduction } = profile

  return (
    <div className="flex items-start gap-4">
      <img
        src={profileImageUrl}
        alt={`${nickname}님의 프로필 사진`}
        className="h-16 w-16 shrink-0 rounded-full object-cover"
      />

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-neutral-11 text-lg font-semibold">{nickname}</span>
            <Tag>{role}</Tag>
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

        {region && <span className="text-neutral-7 text-sm">{region}</span>}
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
