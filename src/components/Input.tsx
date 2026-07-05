type InputProps = {
  id?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  hint?: string
  label?: string
  required?: boolean
}

export default function Input({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  hint,
  label,
  required = false,
}: InputProps) {
  const borderClass = error ? 'border-warning' : 'border-neutral-3 focus:border-primary'

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-caption-lg text-neutral-9 font-semibold">
          {label}
          {required && <span className="text-warning ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-required={required}
        className={`bg-neutral-1 text-body-sm text-neutral-10 placeholder:text-neutral-5 h-12 w-full rounded-lg border px-4 py-3 transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-40 ${borderClass}`}
      />
      {error && <p className="text-caption-sm text-warning">{error}</p>}
      {!error && hint && <p className="text-caption-sm text-neutral-5">{hint}</p>}
    </div>
  )
}
