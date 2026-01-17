
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://instanttea.com';

    // Core static pages
    const routes = [
        '',
        '/about',
        '/privacy',
        '/terms',
        '/why-credits',
        '/governance/contributor-credits',
        '/contact',
        '/login',
        '/sign-up',
        '/data',
        '/ecosystem',
        '/synthesis',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
