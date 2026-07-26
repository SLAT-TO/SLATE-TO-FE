interface BookmarkStarIconProps {
  /** 채움 여부로 즐겨찾기 상태를 표시 */
  filled: boolean
  className?: string
}

export default function BookmarkStarIcon({ filled, className = 'size-6' }: BookmarkStarIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2L14.9 8.6L22 9.3L16.7 14.1L18.2 21L12 17.3L5.8 21L7.3 14.1L2 9.3L9.1 8.6L12 2Z" />
    </svg>
  )
}
