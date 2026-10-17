import { ValueTransformer } from 'typeorm';

/**
 * MySQL returns DECIMAL columns as strings to avoid precision loss.
 * The domain layer works with numbers, so the value is converted on load.
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
