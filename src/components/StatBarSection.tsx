// src/components/StatBarSection.tsx
import ProgressBar from './ProgressBar'
import type { StatItem } from '../types/MyPage.types'

interface StatBarSectionProps {
  title: string
  items: StatItem[]
}

function StatBarSection({ title, items }: StatBarSectionProps) {
  return (
    <div>
      <h3 className="text-text-primary mb-4 text-base font-semibold">{title}</h3>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-4">
            <span className="text-text-secondary w-20 shrink-0 text-sm">{item.label}</span>
            <ProgressBar value={item.value} max={item.max} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StatBarSection
