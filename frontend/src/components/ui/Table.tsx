import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Array<Column<T>>;
  data: T[];
  keyExtractor: (item: T) => string;
}

function renderCell<T>(column: Column<T>, item: T): ReactNode {
  if (column.render) {
    return column.render(item);
  }
  const value = (item as Record<string, unknown>)[column.key];
  if (value === null || value === undefined) {
    return '-';
  }
  return String(value);
}

export function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-600"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-gray-700">
                  {renderCell(column, item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
