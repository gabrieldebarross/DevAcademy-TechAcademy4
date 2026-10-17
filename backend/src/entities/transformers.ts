import { ValueTransformer } from 'typeorm';

/**
 * O MySQL devolve colunas DECIMAL como string para evitar perda de precisão.
 * A camada de domínio trabalha com números, então o valor é convertido ao carregar.
 */
export const decimalTransformer: ValueTransformer = {
  to(value?: number | null): number | null | undefined {
    return value;
  },
  from(value?: string | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    return Number(value);
  },
};
