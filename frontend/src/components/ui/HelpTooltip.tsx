import type { ReactNode } from 'react';

interface HelpTooltipProps {
  children: ReactNode;
}

/**
 * Ícone de ajuda que revela a regra de acesso da tela ao passar o mouse ou
 * focar pelo teclado.
 *
 * É feito só com CSS (`group-hover` / `group-focus-within`), então funciona
 * também sem JavaScript e é acessível pelo teclado.
 */
export function HelpTooltip({ children }: HelpTooltipProps) {
  return (
    <span className="group relative inline-flex items-center align-middle">
      <span
        tabIndex={0}
        role="img"
        aria-label="Regra de acesso"
        className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-gray-300 text-[11px] font-semibold text-gray-500 transition group-hover:border-primary-400 group-hover:text-primary-700 group-focus-within:border-primary-400 group-focus-within:text-primary-700"
      >
        i
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-64 rounded-xl bg-gray-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
