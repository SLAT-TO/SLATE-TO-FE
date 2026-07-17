import { useId, useRef, type ChangeEvent, type Ref } from 'react'

interface FileInputProps {
  id?: string
  name?: string
  value: File[]
  onChange: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  label?: string
  required?: boolean
  className?: string
  ref?: Ref<HTMLInputElement>
}

const FileInput = ({
  id,
  name,
  value,
  onChange,
  accept,
  multiple = false,
  disabled = false,
  error,
  hint,
  label,
  required = false,
  className = '',
  ref,
}: FileInputProps) => {
  const reactId = useId()
  const inputId = id ?? reactId
  const inputRef = useRef<HTMLInputElement>(null)

  const message = error || hint
  const messageId = message ? `${inputId}-desc` : undefined

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const openPicker = () => {
    inputRef.current?.click()
  }

  const borderClass = error
    ? 'border-warning'
    : 'border-border hover:border-primary focus-within:border-primary'

  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-caption-lg text-neutral-9 font-semibold">
          {label}
          {required && <span className="text-warning"> *</span>}
        </label>
      )}
      <div
        className={`bg-bg-primary flex min-h-12 w-full flex-col gap-2 rounded-md border px-3 py-2 transition-colors ${borderClass} ${
          disabled ? 'cursor-not-allowed opacity-40' : ''
        }`}
      >
        <input
          ref={setRefs}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={messageId}
          className="sr-only"
          onChange={handleChange}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          aria-describedby={messageId}
          className="text-body-sm text-primary hover:text-primary-hover w-fit font-semibold disabled:cursor-not-allowed"
        >
          {value.length > 0 ? '파일 변경' : '파일 선택'}
        </button>
        {value.length > 0 && (
          <ul className="flex flex-col gap-1">
            {value.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className="text-caption-lg text-neutral-9 truncate"
              >
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {message && (
        <span
          id={messageId}
          className={`text-caption-sm ${error ? 'text-warning' : 'text-neutral-5'}`}
        >
          {message}
        </span>
      )}
    </div>
  )
}

export default FileInput
