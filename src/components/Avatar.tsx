import { useState } from 'react'
import type { ReactNode } from 'react'

type AvatarBorder = 'gray' | 'black'

interface AvatarProps {
  src?: string // 프로필 이미지 URL
  alt?: string
  size?: number // px 단위, 자유롭게 지정 (기본 40)
  fallback?: ReactNode // 이미지가 없거나 실패했을 때 보여줄 것 (이니셜·아이콘 등)
  border?: AvatarBorder // 테두리 종류 (없으면 테두리 없음)
  onClick?: () => void // 있으면 클릭 가능(프로필 수정 등), 없으면 보여주기 전용
  ariaLabel?: string // 클릭 가능할 때 스크린리더용 라벨 (예: "프로필 수정")
  className?: string
}

// 테두리 스타일 (피그마 값)
const borderStyles: Record<AvatarBorder, string> = {
  gray: 'border border-[#A5A5A5]', // 1px #A5A5A5
  black: 'border-[0.739px] border-[#000]', // 0.739px #000
}

export function Avatar({
  src,
  alt = '',
  size = 40,
  fallback,
  border,
  onClick,
  ariaLabel,
  className,
}: AvatarProps) {
  const [error, setError] = useState(false)
  const [prevSrc, setPrevSrc] = useState(src)

  // src가 바뀌면 렌더 중에 error 리셋 (effect 없이)
  if (src !== prevSrc) {
    setPrevSrc(src)
    setError(false)
  }

  const showImage = src && !error

  const content = showImage ? (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)} // 로딩 실패 시 fallback으로 전환
      className="h-full w-full object-cover"
    />
  ) : (
    fallback
  )

  const style = { width: size, height: size }
  const shape = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-3 ${
    border ? borderStyles[border] : ''
  } ${className ?? ''}`

  // 클릭 가능하면 button (키보드 접근 O), 아니면 div (표시 전용)
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        style={style}
        className={`${shape} cursor-pointer`}
      >
        {content}
      </button>
    )
  }

  return (
    <div style={style} className={shape}>
      {content}
    </div>
  )
}
