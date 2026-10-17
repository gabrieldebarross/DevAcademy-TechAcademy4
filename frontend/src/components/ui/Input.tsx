import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
        invalid
          ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
      } ${className}`}
      {...rest}
    />
  );
});
