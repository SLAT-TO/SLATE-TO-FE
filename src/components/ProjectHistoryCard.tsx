// src/components/ProjectHistoryCard.tsx
import { useEffect, useRef, useState } from 'react'
import type { ProjectHistoryItem } from '../types/MyPage.types'

interface ProjectHistoryCardProps {
  project: ProjectHistoryItem
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * 마이페이지 "프로젝트 이력" 카드
 * 레이아웃: 제목 + 케밥(⋮) → 썸네일 → 태그 순 (피그마 Frame 2147228773 기준)
 * 케밥 클릭 시 "수정하기 / 삭제하기" 드롭다운 노출
 */
function ProjectHistoryCard({ project, onEdit, onDelete }: ProjectHistoryCardProps) {
  const { id, title, thumbnailUrl, tags } = project
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

  const handleEditClick = () => {
    setIsMenuOpen(false)
    onEdit?.(id)
  }

  const handleDeleteClick = () => {
    setIsMenuOpen(false)
    onDelete?.(id)
  }

  return (
    <article className="border-border bg-surface overflow-hidden rounded-xl border">
      {/* 제목 + 케밥 메뉴 */}
      <div className="relative flex items-center justify-between p-3 pb-2">
        <h4 className="text-text-primary text-sm font-semibold">{title}</h4>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="프로젝트 옵션 더보기"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className="text-text-secondary hover:bg-surface-hover shrink-0 rounded p-1"
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
            <button
              type="button"
              role="menuitem"
              onClick={handleEditClick}
              className="text-text-primary hover:bg-surface-hover block w-full px-4 py-2 text-left text-sm"
            >
              수정하기
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleDeleteClick}
              className="text-text-primary hover:bg-surface-hover block w-full px-4 py-2 text-left text-sm"
            >
              삭제하기
            </button>
          </div>
        )}
      </div>

      {/* 썸네일 */}
      <img src={thumbnailUrl} alt={title} className="h-32 w-full object-cover" />

      {/* 태그 */}
      <div className="flex flex-wrap gap-1.5 p-3 pt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-surface-muted text-text-secondary rounded-full px-2 py-0.5 text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

export default ProjectHistoryCard
