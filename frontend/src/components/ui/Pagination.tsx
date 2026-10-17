import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const safeTotal = Math.max(totalPages, 1);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-600">
        Página <strong>{page}</strong> de <strong>{safeTotal}</strong>
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotal}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
