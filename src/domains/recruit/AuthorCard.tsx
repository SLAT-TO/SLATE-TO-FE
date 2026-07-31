import Tag from '../../components/Tag'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import type { RecruitmentAuthor } from '../../types/Recruit.types'

interface AuthorCardProps {
  author: RecruitmentAuthor
  onViewProfile?: () => void
}
/*작성자 시점*/
function AuthorCard({ author, onViewProfile }: AuthorCardProps) {
  return (
    <aside className="bg-bg-primary shadow-card flex w-full shrink-0 flex-col gap-4 rounded-xl p-6 lg:w-[35%]">
      <h3 className="text-body-sm text-neutral-11 font-bold">작성자</h3>
      <div className="flex items-start gap-4">
        <Avatar src={author.profileImageUrl} alt={author.name} size={56} />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-caption-lg text-neutral-11 font-bold">{author.name}</span>
            <Tag>{author.role}</Tag>
          </div>
          <span className="text-caption-sm text-neutral-6">{author.region}</span>
          <span className="text-caption-sm text-neutral-6">{author.email}</span>
        </div>
      </div>
      <div className="px-4">
        <Button
          variant="secondary"
          onClick={onViewProfile}
          icon={
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12C8.619 12 7.5 13.119 7.5 14.5V19.5H12.5V14.5C12.5 13.119 11.381 12 10 12Z" />
              <path d="M14.167 14.5V19.5H17.5C18.881 19.5 20 18.381 20 17V9.4C20.0002 8.967 19.832 8.551 19.531 8.24L12.449 0.584C11.2-.268 9.091-.35 7.739.899 7.675.959 7.613 1.02 7.553 1.084L.484 8.737C.174 9.05 0 9.472 0 9.912V17C0 18.381 1.119 19.5 2.5 19.5H5.833V14.5C5.849 12.228 7.684 10.373 9.899 10.319 12.188 10.264 14.149 12.151 14.167 14.5Z" />
            </svg>
          }
          fullWidth
        >
          프로필 보기
        </Button>
      </div>
    </aside>
  )
}

export default AuthorCard
