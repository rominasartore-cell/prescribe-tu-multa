import type { Metadata } from 'next';
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Prescribe Tu Multa | Análisis Legal de Multas de Tránsito en Chile',
  description:
    'Plataforma legal-tech que analiza multas de tránsito chilenas, determina su estado de prescripción y genera documentos legales automáticamente.',
  keywords: [
    'multa de tránsito',
    'Chile',
    'prescripción',
    'RMNP',
    'legal tech',
    'análisis legal',
    'documentos legales',
  ],
  authors: [{ name: 'Prescribe Tu Multa' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: process.env.NEXTAUTH_URL,
    title: 'Prescribe Tu Multa',
    description: 'Análisis Legal de Multas de Tránsito en Chile',
    images: [
      {
        url: `${process.env.NEXTAUTH_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prescribe Tu Multa',
    description: 'Análisis Legal de Multas de Tránsito en Chile',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body>
        <SessionProvider session={session}>
          <div className="min-h-screen flex flex-col bg-white">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
