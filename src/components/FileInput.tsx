import { useId, useRef, useState, type ChangeEvent, type DragEvent, type Ref } from 'react'
import uploadIcon from '../assets/icons/upload.svg?raw'

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
  maxSizeBytes?: number
  onInvalidFiles?: (files: File[]) => void
  /** multiple이 false인데 유효한 파일을 2개 이상 고르면(드래그앤드롭은 HTML multiple 속성의
   * 영향을 안 받아 여러 개를 그대로 받는다) 첫 번째만 쓰고 나머지는 조용히 버려진다.
   * 그 버려진 개수를 알려줘서 호출부가 사용자에게 안내할 수 있게 한다. */
  onExtraFilesIgnored?: (ignoredCount: number) => void
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
  maxSizeBytes,
  onInvalidFiles,
  onExtraFilesIgnored,
  className = '',
  ref,
}: FileInputProps) => {
  const reactId = useId()
  const inputId = id ?? reactId
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const hintId = hint && !error ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const labelId = label ? `${inputId}-label` : undefined

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const fileMatchesAccept = (file: File) => {
    if (!accept) return true
    const patterns = accept
      .split(',')
      .map((pattern) => pattern.trim())
      .filter(Boolean)
    return patterns.some((pattern) => {
      if (pattern.startsWith('.')) {
        return file.name.toLowerCase().endsWith(pattern.toLowerCase())
      }
      if (pattern.endsWith('/*')) {
        return file.type.startsWith(pattern.slice(0, -1))
      }
      return file.type === pattern
    })
  }

  const isValidFile = (file: File) =>
    fileMatchesAccept(file) && (maxSizeBytes == null || file.size <= maxSizeBytes)

  const selectFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => !isValidFile(file))
    if (invalidFiles.length > 0) onInvalidFiles?.(invalidFiles)

    let validFiles = files.filter(isValidFile)
    let ignoredCount = 0
    if (!multiple && validFiles.length > 1) {
      ignoredCount = validFiles.length - 1
      validFiles = [validFiles[0]!]
    }
    if (validFiles.length > 0) onChange(validFiles)
    // onChange 다음에 호출 — 호출부가 onChange 안에서 에러/안내 상태를 지우는 경우가 많아서,
    // 먼저 호출하면 이 안내가 그 자리에서 바로 덮어써진다.
    if (ignoredCount > 0) onExtraFilesIgnored?.(ignoredCount)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    selectFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          id={labelId}
          htmlFor={inputId}
          className="text-head-sm text-neutral-10 font-semibold"
        >
          {label}
          {required && <span className="text-warning"> *</span>}
        </label>
      )}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={hintId ?? errorId}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-neutral-2 flex w-full flex-col items-center justify-center gap-2 rounded-lg border px-6 py-[29px] text-center transition-colors md:gap-2.5 lg:gap-3 lg:px-10 lg:py-9 xl:py-10 ${
          isDragging ? 'border-primary' : 'border-neutral-3'
        } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
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
          className="sr-only"
          onChange={handleChange}
        />
        <span
          aria-hidden
          className="text-neutral-5 inline-flex size-6 shrink-0 lg:size-7 xl:size-8 [&_svg]:block [&_svg]:size-full"
          dangerouslySetInnerHTML={{ __html: uploadIcon }}
        />
        <div className="text-neutral-5 flex flex-col items-center gap-2">
          <p className="text-body-sm">이곳에 파일을 추가해주세요.</p>
          <p className="text-caption-sm">파일을 드래그하거나 클릭하여 업로드</p>
        </div>
        {hint && !error && (
          <p id={hintId} className="text-caption-sm text-neutral-5 mt-3">
            {hint}
          </p>
        )}
      </div>
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
      {error && (
        <p id={errorId} className="text-caption-sm text-warning">
          {error}
        </p>
      )}
    </div>
  )
}

export default FileInput
