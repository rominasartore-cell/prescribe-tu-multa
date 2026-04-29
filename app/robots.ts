import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://prescribetumulta.cl';
  const SITE_URL = rawSiteUrl.replace(/\/$/, '');

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
