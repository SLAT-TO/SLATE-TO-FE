import { memo } from 'react'
import type { ReactNode } from 'react'

/** primary=??, secondary=??·??, ghost=??·??? */
type TagVariant = 'primary' | 'secondary' | 'ghost'

interface TagProps {
  children: ReactNode
  variant?: TagVariant
  className?: string
}

const base =
  'inline-flex h-6 items-center justify-center rounded-[3px] px-[19px] text-caption-sm font-semibold whitespace-nowrap'

const variantStyles: Record<TagVariant, string> = {
  primary: 'bg-tag-role-bg text-tag-role-text',
  secondary: 'bg-tag-active-bg text-tag-active-text',
  ghost: 'bg-tag-done-bg text-tag-done-text',
}

export default memo(function Tag({ children, variant = 'primary', className = '' }: TagProps) {
  return <span className={`${base} ${variantStyles[variant]} ${className}`}>{children}</span>
})
