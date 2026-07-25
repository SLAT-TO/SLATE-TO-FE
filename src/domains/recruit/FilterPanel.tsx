import type { FilterConfig } from '../../types/Recruit.types'

interface FilterPanelProps {
  config: FilterConfig
  selected: string[]
  onToggle: (value: string) => void
}

function FilterPanel({ config, selected, onToggle }: FilterPanelProps) {
  const visibleGroups = config.groups.filter((group) => group.showWhen?.(selected) ?? true)

  return (
    <div className="shadow-panel flex gap-12 rounded-xl bg-white pt-[34px] pr-8 pb-[55px] pl-[33px]">
      {visibleGroups.map((group) => (
        <section
          key={`${group.label}-${group.span ?? 'default'}`}
          className={group.span === 'narrow' ? 'w-40 shrink-0' : 'flex-1'}
        >
          <h3 className="text-caption-lg text-neutral-11 mb-[25px] font-semibold">{group.label}</h3>

          <div
            className={`grid gap-x-6 gap-y-3 ${
              group.span === 'narrow' ? 'grid-cols-1' : 'grid-cols-5'
            }`}
          >
            {group.options.map((option) => {
              const isSelected = selected.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onToggle(option)}
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
