import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50 px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 font-display text-lg font-bold text-white">
        DA
      </span>
      <p className="font-display text-6xl font-bold text-primary-700">404</p>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Página não encontrada
      </h1>
      <p className="max-w-md text-sm text-gray-500">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-800"
      >
        Voltar para o painel
      </Link>
    </div>
  );
}
