interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Carregando...' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
