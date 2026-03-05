import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/mdx';

export const alt = 'InstantTea Literature';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const p = await params;
    const post = await getPostBySlug('literature', p.slug);

    // Fallback if not found
    const title = post?.frontmatter.title || 'InstantTea Literature';
    const author = post?.frontmatter.author || 'InstantTea Team';

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
                    padding: '80px',
                    fontFamily: '"Geist", "Inter", sans-serif',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#3b82f6', // blue-500
                        fontWeight: 'bold',
                        fontSize: '32px',
                        marginBottom: '40px',
                        letterSpacing: '-0.05em'
                    }}>
                        InstantTea
                        <span style={{ color: '#0f172a', marginLeft: '12px' }}>Literature</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        color: '#0f172a', // slate-900
                        fontSize: '72px',
                        fontWeight: '900',
                        lineHeight: '1.1',
                        letterSpacing: '-0.05em',
                        marginBottom: '40px',
                        maxWidth: '900px'
                    }}>
                        {title}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    borderTop: '2px solid #e2e8f0', // slate-200
                    paddingTop: '40px'
                }}>
                    <div style={{
                        display: 'flex',
                        color: '#64748b', // slate-500
                        fontSize: '32px',
                        fontWeight: '600'
                    }}>
                        {author}
                    </div>
                    <div style={{
                        display: 'flex',
                        color: '#94a3b8', // slate-400
                        fontSize: '28px',
                        fontWeight: '500'
                    }}>
                        instanttea.com
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
