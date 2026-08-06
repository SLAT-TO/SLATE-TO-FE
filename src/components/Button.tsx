import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

// 피그마 Hierarchy에 대응
type ButtonVariant = 'primary' | 'secondary' | 'negative' | 'negativeOutline'
type ButtonSize = 'md' | 'sm' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  icon?: ReactNode // 선택적 아이콘 (텍스트 왼쪽에 표시)
  ref?: Ref<HTMLButtonElement> // React 19: ref를 prop으로 직접 전달
  width?: string | number // 지정 시 프리셋 너비 대신 이 값을 사용
  height?: string | number // 지정 시 프리셋 높이 대신 이 값을 사용
}

// 공통 스타일 (버튼 타이포그래피: 600 / 150% / 자간 -0.176px)
const base =
  'inline-flex items-center justify-center gap-2.5 font-semibold leading-normal tracking-[-0.176px] transition-colors disabled:cursor-not-allowed'

// 크기별 스타일 (높이, 패딩, 폰트, radius)
// 너비는 widthStyles에서 별도로 관리하여 fullWidth와 충돌하지 않도록 분리
const sizeStyles: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-base rounded-lg',
  sm: 'h-8 px-4 text-sm rounded-lg',
  lg: 'h-12 pt-2 pr-[93px] pb-2 pl-[92px] text-base rounded-[6.828px]',
}

// 피그마 기본 너비
// fullWidth=true 또는 width prop 지정 시 적용하지 않음
const widthStyles: Record<ButtonSize, string> = {
  md: 'w-[240px]',
  sm: 'w-[200px]',
  lg: 'w-[400px]',
}

// 종류별 스타일 (default / hover / disabled 상태 포함)
// disabled 색은 계열마다 다름: primary는 회색 채움, secondary는 회색 테두리
// primary는 모든 사이즈에서 동일한 배경색 사용
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover disabled:bg-neutral-4 disabled:text-neutral-6 disabled:hover:bg-neutral-4',
  secondary:
    'border border-secondary bg-white text-secondary hover:border-secondary-hover hover:text-secondary-hover disabled:border-neutral-5 disabled:text-neutral-5 disabled:hover:border-neutral-5 disabled:hover:text-neutral-5',
  // 취소/부정 액션용 — disabled 회색 팔레트를 그대로 재사용하되 실제로는 클릭 가능
  negative: 'bg-neutral-4 text-neutral-6 hover:bg-neutral-5',
  negativeOutline:
    'border border-neutral-5 bg-white text-neutral-5 hover:border-neutral-6 hover:text-neutral-6',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  icon,
  children,
  className,
  style,
  width,
  height,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        base,
        sizeStyles[size],
        // fullWidth 또는 width prop이 있으면 기본 너비 클래스는 적용하지 않음
        !fullWidth && width === undefined ? widthStyles[size] : '',
        fullWidth ? 'w-full' : '',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...style,
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
