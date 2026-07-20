import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

// 피그마 Hierarchy에 대응
type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'md' | 'sm' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  icon?: ReactNode // 선택적 아이콘 (텍스트 왼쪽에 표시)
  ref?: Ref<HTMLButtonElement> // React 19: ref를 prop으로 직접 전달
}

// 공통 스타일 (버튼 타이포그래피: 600 / 150% / 자간 -0.176px)
// radius는 사이즈별로 다르므로 sizeStyles에서 정의
const base =
  'inline-flex items-center justify-center gap-2.5 font-semibold leading-normal tracking-[-0.176px] transition-colors disabled:cursor-not-allowed'

// 크기별 스타일
// md: 240x40, sm: 200x32 (padding 8px 16px, radius 8px)
// lg: 400x48 (padding 8px 93px/92px, radius 6.83px) - 피그마 스펙 그대로 반영
const sizeStyles: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-base rounded-lg',
  sm: 'h-8 px-4 text-sm rounded-lg',
  lg: 'w-[400px] h-12 pt-2 pr-[93px] pb-2 pl-[92px] text-base rounded-[6.83px]',
}

// 종류별 스타일 (default / hover / disabled 상태 포함)
// disabled 색은 계열마다 다름: primary는 회색 채움, secondary는 회색 테두리
// primary 배경색은 크기에 따라 달라지므로(lg는 그라데이션) bg-* 클래스는 여기서 빼고 getBackgroundStyle에서 결정
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'text-white hover:bg-primary-hover disabled:bg-neutral-4 disabled:text-neutral-6 disabled:hover:bg-neutral-4',
  secondary:
    'border border-secondary bg-white text-secondary hover:border-secondary-hover hover:text-secondary-hover disabled:border-neutral-5 disabled:text-neutral-5 disabled:hover:border-neutral-5 disabled:hover:text-neutral-5',
}

// primary + lg 조합만 피그마 스펙에 따라 그라데이션 배경 사용
function getBackgroundStyle(variant: ButtonVariant, size: ButtonSize) {
  if (variant !== 'primary') return ''
  return size === 'lg' ? 'bg-[linear-gradient(90deg,#0570FC_0%,#039DF7_100%)]' : 'bg-primary'
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  icon,
  children,
  className,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${getBackgroundStyle(variant, size)} ${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
