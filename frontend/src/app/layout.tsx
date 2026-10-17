import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevAcademy',
  description: 'Painel administrativo da DevAcademy',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
