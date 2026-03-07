
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
                '/governance/dashboard/',
                '/timeline/',
                '/empirical/',
                '/comparison/',
                '/admin/',
                '/analysis/',
                '/compare-machines/',
                '/tea-analysis/',
                '/structural-concern/',
                '/escalation/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
