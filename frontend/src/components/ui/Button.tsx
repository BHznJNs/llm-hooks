import clsx from 'clsx';
import type { ReactNode } from 'react';

type ButtonProps = {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

export function Button({
  size = 'medium',
  variant = 'primary',
  disabled = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'p-2 h-8 w-8 shadow-none hover:shadow-sm';
      case 'medium':
        return 'px-4 py-2 shadow-sm hover:shadow-md';
      case 'large':
        return 'px-6 py-2 shadow-md hover:shadow-lg';
      default:
        return 'px-4 py-2 shadow-sm hover:shadow-md';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'secondary':
        return 'bg-transparent text-gray-800 border border-gray-300 hover:bg-gray-300 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700';
      case 'tertiary':
        return 'bg-transparent text-gray-600 border border-2 border-transparent hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:border-gray-700';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const baseClasses =
    'inline-flex gap-2 cursor-pointer items-center justify-center rounded-md text font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  const classes = clsx(
    baseClasses,
    getSizeClass(),
    className ? null : getVariantClass(),
    className
  );

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
