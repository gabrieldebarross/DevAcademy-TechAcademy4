import type { ReactNode } from 'react';

import { HelpTooltip } from './HelpTooltip';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Regra de acesso exibida em um ícone de ajuda ao lado do título. */
  help?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, help, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-gray-900">
          {title}
          {help && <HelpTooltip>{help}</HelpTooltip>}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
