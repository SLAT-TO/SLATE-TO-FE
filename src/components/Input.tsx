type InputProps = {
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
};

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  errorMessage,
  label,
}: InputProps) {
  const borderClass = error
    ? 'border-warning'
    : 'border-neutral-3 focus:border-primary';

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-caption-lg font-semibold text-neutral-9">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-12 w-full rounded-lg border bg-neutral-1 px-4 py-3 text-body-sm text-neutral-10 outline-none transition-colors placeholder:text-neutral-5 disabled:cursor-not-allowed disabled:opacity-40 ${borderClass}`}
      />
      {error && errorMessage && (
        <p className="text-caption-sm text-warning">{errorMessage}</p>
      )}
    </div>
  );
}
