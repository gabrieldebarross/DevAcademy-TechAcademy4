import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid = false, className = '', children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
        invalid
          ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});
