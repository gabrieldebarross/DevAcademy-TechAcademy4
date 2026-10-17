interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'Nenhum registro encontrado',
  description = 'Comece cadastrando um novo item.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/70 px-6 py-12 text-center">
      <span
        className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-primary-500" />
      </span>
      <p className="font-display text-base font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
