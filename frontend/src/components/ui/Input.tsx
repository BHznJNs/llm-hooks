import clsx from 'clsx';
import type { ReactNode } from 'react';

type InputProps = {
  variant?: 'small' | 'normal';
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
  type?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
};

export function Input({
  variant = 'normal',
  prefix,
  suffix,
  className,
  type = 'text',
  id,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  ...props
}: InputProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'small':
        return 'px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white';
      default: // also for 'normal' variant
        return 'px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 shadow-input dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400';
    }
  };

  const baseClasses =
    'w-full transition duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 dark:focus:ring-blue-600';

  const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : '';

  const classes = clsx(
    baseClasses,
    getVariantClass(),
    disabledClasses,
    className
  );

  const prefixSuffixClasses = 'text-gray-400 dark:text-gray-500';

  if (prefix || suffix) {
    return (
      <div className="relative flex items-center">
        {prefix && (
          <div
            className={clsx(
              'absolute left-3 flex items-center',
              prefixSuffixClasses
            )}
          >
            {prefix}
          </div>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={clsx(
            classes,
            prefix ? 'pl-10' : '',
            suffix ? 'pr-10' : ''
          )}
          {...props}
        />
        {suffix && (
          <div
            className={clsx(
              'absolute right-3 flex items-center',
              prefixSuffixClasses
            )}
          >
            {suffix}
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={classes}
      {...props}
    />
  );
}
