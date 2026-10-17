import { forwardRef, type InputHTMLAttributes } from 'react';
import { Input } from './Input';
import { maskCurrency } from '@/utils/formatters';

interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
}

/**
 * Campo de moeda que mascara a entrada no formato brasileiro (`0,00`) enquanto
 * o usuário digita. O componente pai guarda a string mascarada e a converte de
 * volta para número com `parseCurrency` antes de enviar à API.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onValueChange, ...rest }, ref) {
    return (
      <Input
        ref={ref}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        value={maskCurrency(value)}
        onChange={(event) => onValueChange(maskCurrency(event.target.value))}
        {...rest}
      />
    );
  },
);
