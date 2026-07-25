import { useEffect, useRef } from 'react'
import SortDropdown from './SortDropdown'
import FilterPanel from './FilterPanel'
import FilterChip from './FilterChip'
import { FILTER_CONFIGS, type SortValue } from '../../constants'
import type { FilterCategory, SelectedFilterChip, SelectedFilters } from '../../types/Recruit.types'

interface JobFilterBarProps {
  sort: SortValue
  onSortChange: (value: SortValue) => void
  selectedFilters: SelectedFilters
  onToggleFilter: (category: FilterCategory, value: string) => void
  openCategory: FilterCategory | null
  onOpenCategoryChange: (category: FilterCategory | null) => void
  chips: SelectedFilterChip[]
}

function JobFilterBar({
  sort,
  onSortChange,
  selectedFilters,
  onToggleFilter,
  openCategory,
  onOpenCategoryChange,
  chips,
}: JobFilterBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const openConfig = FILTER_CONFIGS.find((config) => config.key === openCategory)

  useEffect(() => {
    if (!openCategory) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onOpenCategoryChange(null)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenCategoryChange(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openCategory, onOpenCategoryChange])

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SortDropdown value={sort} onChange={onSortChange} />

        {FILTER_CONFIGS.map((config) => (
          <button
            key={config.key}
            type="button"
            onClick={() => onOpenCategoryChange(openCategory === config.key ? null : config.key)}
            aria-expanded={openCategory === config.key}
            className="border-primary text-primary text-caption-lg flex items-center gap-1 rounded-lg border bg-white px-4 py-2"
          >
            {config.buttonLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        ))}
      </div>

      {openConfig && (
        <FilterPanel
          config={openConfig}
          selected={selectedFilters[openConfig.key]}
          onToggle={(value) => onToggleFilter(openConfig.key, value)}
        />
      )}

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {chips.map((chip) => (
            <li key={`${chip.category}-${chip.value}`}>
              <FilterChip
                label={chip.value}
                onRemove={() => onToggleFilter(chip.category, chip.value)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default JobFilterBar
