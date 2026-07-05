import type { ReactNode } from 'react'

type TagVariant = 'primary' | 'secondary' | 'ghost'
type TagSize = 'sm' | 'md' | 'lg'

interface TagProps {
  children: ReactNode
  variant?: TagVariant
  size?: TagSize
  className?: string
}

const base = 'inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap'

const sizeStyles: Record<TagSize, string> = {
  sm: 'px-2 py-0.5 text-caption-sm',
  md: 'px-2.5 py-1 text-caption-lg',
  lg: 'px-3 py-1.5 text-body-sm',
}

const variantStyles: Record<TagVariant, string> = {
  primary: 'bg-primary-light text-primary',
  secondary: 'border border-border bg-neutral-1 text-neutral-9',
  ghost: 'bg-neutral-2 text-neutral-8',
}

export default function Tag({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
}: TagProps) {
  return (
    <span className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
