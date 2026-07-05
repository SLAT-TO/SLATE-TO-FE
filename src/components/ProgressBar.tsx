interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'default' | 'success' | 'warning'
  className?: string
}

export default function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  className = '',
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const clampedValue = Math.min(safeMax, Math.max(0, value))
  const percentage = (clampedValue / safeMax) * 100

  const variantColor = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
  }[variant]

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      className={`bg-neutral-3 h-2 w-full rounded-full ${className}`}
    >
      <div
        className={`h-full rounded-full ${variantColor} transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
