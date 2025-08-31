import type { ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  htmlFor?: string;
};

export function FormField({
  label,
  children,
  error,
  required,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block font-medium text-gray-700 text-sm dark:text-gray-300"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
