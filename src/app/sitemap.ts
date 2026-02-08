
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://instanttea.com';

    // Only include publicly accessible pages (no auth required)
    const routes: Array<{
        path: string;
        changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
        priority: number;
    }> = [
            { path: '', changeFrequency: 'weekly', priority: 1.0 },
            { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
            { path: '/privacy', changeFrequency: 'monthly', priority: 0.5 },
            { path: '/terms', changeFrequency: 'monthly', priority: 0.5 },
            { path: '/why-credits', changeFrequency: 'monthly', priority: 0.7 },
            { path: '/governance/contributor-credits', changeFrequency: 'monthly', priority: 0.6 },
            { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
            { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
            { path: '/login', changeFrequency: 'monthly', priority: 0.4 },
            { path: '/sign-up', changeFrequency: 'monthly', priority: 0.6 },
        ];

    return routes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
}
