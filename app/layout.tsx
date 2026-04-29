import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://prescribetumulta.cl';

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
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: SITE_URL,
    title: 'Prescribe Tu Multa',
    description: 'Análisis Legal de Multas de Tránsito en Chile',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body>
        <Providers session={null}>
          <div className="min-h-screen flex flex-col bg-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
