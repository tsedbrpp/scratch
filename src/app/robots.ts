
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://policyprism.io';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/settings/',
                '/dashboard/',
                '/results/',
                '/data/',
                '/ecosystem/',
                '/cultural/',
                '/reflexivity/',
                '/synthesis/',
                '/ontology/',
                '/resistance/',
                '/governance/',
                '/timeline/',
                '/empirical/',
                '/comparison/',
                '/admin/',
                '/analysis/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
