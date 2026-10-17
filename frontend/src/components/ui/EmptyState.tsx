interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'Nenhum registro encontrado',
  description = 'Comece cadastrando um novo item.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <p className="text-base font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
