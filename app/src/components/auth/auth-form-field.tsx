"use client";

interface AuthFormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
}

export function AuthFormField({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
}: AuthFormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="brutal-border w-full px-4 py-3 text-base focus:border-[#3B82F6] focus:outline-none"
      />
      {error && <p className="mt-1 text-sm text-[#EF4444]">{error}</p>}
    </div>
  );
}
