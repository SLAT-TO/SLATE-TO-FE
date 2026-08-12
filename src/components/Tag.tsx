import { memo } from 'react'
import type { ReactNode } from 'react'

/** primary=직무, secondary=진행·모집, ghost=완료·비활성, meta=영상 메타 */
export type TagVariant = 'primary' | 'secondary' | 'ghost' | 'meta'

interface TagProps {
  children: ReactNode
  variant?: TagVariant
  className?: string
}

const base =
  'inline-flex h-6 min-w-[72px] items-center justify-center rounded-[3px] px-3 text-caption-sm font-semibold whitespace-nowrap'

const variantStyles: Record<TagVariant, string> = {
  primary: 'bg-tag-role-bg text-tag-role-text',
  secondary: 'bg-tag-active-bg text-tag-active-text',
  ghost: 'bg-tag-done-bg text-tag-done-text',
  meta: 'bg-neutral-2 text-neutral-7',
}

export default memo(function Tag({ children, variant = 'primary', className = '' }: TagProps) {
  return <span className={`${base} ${variantStyles[variant]} ${className}`}>{children}</span>
})
