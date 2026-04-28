import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'https://prescribetumulta.cl';

// Open Graph Image - Dynamic via ogcdn.net
// Format: https://ogcdn.net/{templateId}/v{version}/{variable1}/{variable2}/.../og.png
// All values must be URL encoded. Use "_" for default values.
const OG_IMAGE_URL =
  process.env.NEXT_PUBLIC_OG_IMAGE_URL ||
  'https://ogcdn.net/prescribe-tu-multa/v1/Prescribe%20Tu%20Multa/An%C3%A1lisis%20de%20Multas%20de%20Tr%C3%A1nsito/og.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prescribe Tu Multa',
    description: 'Análisis Legal de Multas de Tránsito en Chile',
    images: [OG_IMAGE_URL],
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
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col bg-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
