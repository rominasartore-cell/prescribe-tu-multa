import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXTAUTH_URL || 'https://prescribe-tu-multa.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/auth/', '/legal/'],
        disallow: ['/api/', '/dashboard/', '/checkout/', '/_next/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
