// src/components/ProjectHistoryCard.tsx
import { useEffect, useRef, useState } from 'react'
import type { ProjectHistoryItem } from '../../types/MyPage.types'
import Tag from '../../components/Tag'

interface ProjectHistoryCardProps {
  project: ProjectHistoryItem
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

function ProjectHistoryCard({ project, onEdit, onDelete, onClick }: ProjectHistoryCardProps) {
  const { id, title, thumbnailUrl, tags, metaTagCount = 0 } = project
  const hasMenu = Boolean(onEdit || onDelete)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 추가
    setIsMenuOpen(false)
    onEdit?.(id)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 추가
    setIsMenuOpen(false)
    onDelete?.(id)
  }
  return (
    <article
      onClick={() => onClick?.(id)}
      className={[
        'overflow-hidden rounded-xl bg-white shadow-xs',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="relative flex items-center justify-between p-3 pb-2">
        <h4 className="text-neutral-11 text-sm font-semibold">{title}</h4>

        {hasMenu && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen((prev) => !prev)
              }}
              aria-label="프로젝트 옵션 더보기"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className="text-neutral-7 hover:bg-neutral-1 shrink-0 rounded p-1"
            >
              {/* 인라인 SVG - svgr 미도입 상태라 인라인 방식 유지 */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="3" r="1.3" fill="currentColor" />
                <circle cx="8" cy="8" r="1.3" fill="currentColor" />
                <circle cx="8" cy="13" r="1.3" fill="currentColor" />
              </svg>
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                role="menu"
                className="border-border absolute top-10 right-3 z-10 w-32 overflow-hidden rounded-lg border bg-white shadow-md"
              >
                {onEdit && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleEditClick}
                    className="text-neutral-11 hover:bg-neutral-1 block w-full px-4 py-2 text-left text-sm"
                  >
                    수정하기
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDeleteClick}
                    className="text-neutral-11 hover:bg-neutral-1 block w-full px-4 py-2 text-left text-sm"
                  >
                    삭제하기
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 썸네일 */}
      <div className="px-3">
        <img src={thumbnailUrl} alt={title} className="h-32 w-full rounded-lg object-cover" />
      </div>

      {/* 태그 */}
      <div className="flex flex-wrap gap-1.5 p-3 pt-2">
        {tags.map((tag, index) => (
          <Tag key={`${tag}-${index}`} variant={index < metaTagCount ? 'ghost' : 'primary'}>
            {tag}
          </Tag>
        ))}
      </div>
    </article>
  )
}

export default ProjectHistoryCard
