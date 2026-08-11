import type { FilterConfig } from '../../types/Recruit.types'

interface FilterPanelProps {
  config: FilterConfig
  selected: string[]
  onToggle: (value: string, groupOptions?: string[]) => void
}

// Tailwind는 클래스 문자열을 정적으로 스캔하므로 동적 조합(`grid-cols-${n}`) 불가.
// 실제 클래스를 매핑으로 나열해 스캔되도록 함.
const GRID_COLS: Record<number, string> = {
  4: 'grid-cols-4',
  5: 'grid-cols-5',
}

function FilterPanel({ config, selected, onToggle }: FilterPanelProps) {
  const visibleGroups = config.groups.filter((group) => group.showWhen?.(selected) ?? true)

  return (
    <div className="shadow-panel bg-bg-primary flex gap-12 rounded-xl pt-[34px] pr-8 pb-[55px] pl-[33px]">
      {visibleGroups.map((group) => (
        <section
          key={`${group.label}-${group.span ?? 'default'}`}
          className={group.span === 'narrow' ? 'w-40 shrink-0' : 'flex-1'}
        >
          <h3 className="text-caption-lg text-neutral-11 mb-[25px] font-semibold">{group.label}</h3>

          <div
            className={`grid gap-x-6 gap-y-3 ${
              group.span === 'narrow'
                ? 'grid-cols-1'
                : (GRID_COLS[group.columns ?? 5] ?? 'grid-cols-5')
            }`}
          >
            {group.options.map((option) => {
              const isSelected = selected.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onToggle(option, group.single ? group.options : undefined)}
                  aria-pressed={isSelected}
                  className={`text-caption-lg flex items-center gap-2 text-left ${
                    isSelected ? 'text-neutral-11 font-medium' : 'text-neutral-6'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1.5 shrink-0 rounded-full ${
                      isSelected ? 'bg-primary' : 'bg-transparent'
                    }`}
                  />
                  {option}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default FilterPanel
