import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

/** DateSingleField·DateRangeField처럼 자체 label이 없는 컴포넌트용 래퍼 */
function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-caption-lg text-neutral-9 font-semibold">
        {label}
        {required && <span className="text-warning ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-caption-sm text-warning">{error}</p>}
    </div>
  )
}

export default FormField
