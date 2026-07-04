import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

// 피그마 Hierarchy에 대응
type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  icon?: ReactNode // 선택적 아이콘 (텍스트 왼쪽에 표시)
  ref?: Ref<HTMLButtonElement> // React 19: ref를 prop으로 직접 전달
}

// 공통 스타일 (버튼 타이포그래피: 600 / 150% / 자간 -0.176px)
const base =
  'inline-flex items-center justify-center gap-2.5 rounded-lg font-semibold leading-normal tracking-[-0.176px] transition-colors disabled:cursor-not-allowed'

// 크기별 스타일 (피그마: md 40px, sm 32px / padding 8px 16px)
const sizeStyles: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-base',
  sm: 'h-8 px-4 text-sm',
}

// 종류별 스타일 (default / hover / disabled 상태 포함)
// disabled 색은 계열마다 다름: primary는 회색 채움, secondary는 회색 테두리
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover disabled:bg-neutral-4 disabled:text-neutral-6 disabled:hover:bg-neutral-4',
  secondary:
    'border border-primary bg-white text-primary hover:border-primary-hover hover:text-primary-hover disabled:border-neutral-5 disabled:text-neutral-5 disabled:hover:border-neutral-5 disabled:hover:text-neutral-5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
