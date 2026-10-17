import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="text-2xl font-semibold text-gray-900">
        Página não encontrada
      </h1>
      <p className="max-w-md text-sm text-gray-500">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        Voltar para o painel
      </Link>
    </div>
  );
}
