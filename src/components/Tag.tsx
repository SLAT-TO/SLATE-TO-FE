import { memo } from 'react'
import type { ReactNode } from 'react'

/** primary=직무, secondary=진행·모집, ghost=완료·비활성 */
export type TagVariant = 'primary' | 'secondary' | 'ghost'

interface TagProps {
  children: ReactNode
  variant?: TagVariant
  className?: string
}

const base =
  'inline-flex h-6 w-[72px] items-center justify-center rounded-[3px] text-caption-sm font-semibold whitespace-nowrap'

const variantStyles: Record<TagVariant, string> = {
  primary: 'bg-tag-role-bg text-tag-role-text',
  secondary: 'bg-tag-active-bg text-tag-active-text',
  ghost: 'bg-tag-done-bg text-tag-done-text',
}

export default memo(function Tag({ children, variant = 'primary', className = '' }: TagProps) {
  return <span className={`${base} ${variantStyles[variant]} ${className}`}>{children}</span>
})
