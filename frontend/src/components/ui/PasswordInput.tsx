import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ invalid = false, className = '', ...rest }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-lg border px-3 py-2 pr-16 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
            invalid
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
          } ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-gray-500 hover:text-gray-700"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    );
  },
);
