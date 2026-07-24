// src/components/ProfileSummaryCard.tsx
import type { ProfileSummary } from '../types/MyPage.types'

interface ProfileSummaryCardProps {
  profile: ProfileSummary
  onEditClick: () => void
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
        <div className="flex items-center gap-2">
          <span className="text-text-primary text-lg font-semibold">{nickname}</span>
          <span className="bg-accent-subtle text-accent rounded-full px-2 py-0.5 text-xs font-medium">
            {role}
          </span>
        </div>
        {region && <span className="text-text-secondary text-sm">{region}</span>}
        <span className="text-text-secondary text-sm">{email}</span>
        <p className="text-text-secondary mt-2 text-sm whitespace-pre-line">
          {introduction?.trim() ? (
            introduction
          ) : (
            <span className="text-text-tertiary">한 줄 자기소개를 입력해주세요.</span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={onEditClick}
        className="border-border text-text-primary hover:bg-surface-hover shrink-0 rounded-md border px-3 py-1.5 text-sm"
      >
        수정하기
      </button>
    </div>
  )
}

export default ProfileSummaryCard
