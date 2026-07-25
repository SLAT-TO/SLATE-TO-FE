interface InlineIconProps {
  /** SVG 원본 마크업 (?raw import) */
  svg: string
  className?: string
}

export default function InlineIcon({ svg, className = '' }: InlineIconProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 [&_svg]:block [&_svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
