interface FilterChipProps {
  label: string
  onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`${label} 필터 해제`}
      className="bg-tag-role-bg text-tag-role-text text-caption-sm inline-flex h-6 items-center gap-1.5 rounded-[3px] px-3 font-semibold whitespace-nowrap"
    >
      {label}
      <span aria-hidden>×</span>
    </button>
  )
}

export default FilterChip
