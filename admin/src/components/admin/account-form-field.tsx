"use client";

interface AccountFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
}

export function AccountFormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
}: AccountFormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-bold uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="brutal-border w-full px-4 py-3 text-base focus:border-[#3B82F6] focus:outline-none"
      />
      {error && (
        <p className="mt-1 text-sm text-[#EF4444]" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
