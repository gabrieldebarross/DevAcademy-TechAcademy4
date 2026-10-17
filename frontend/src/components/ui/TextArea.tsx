import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ invalid = false, className = '', ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
          invalid
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
        } ${className}`}
        {...rest}
      />
    );
  },
);
