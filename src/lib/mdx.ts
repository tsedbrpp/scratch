import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

const contentDirectory = path.join(process.cwd(), 'src/content');

export interface MdxFrontmatter {
    title: string;
    description: string;
    date: string;
    author?: string;
    [key: string]: any;
}

export interface MdxPost {
    slug: string;
    frontmatter: MdxFrontmatter;
    content: string;
}

// Ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

export async function getPostBySlug(contentType: string, slug: string): Promise<MdxPost | null> {
    try {
        const fullPath = path.join(contentDirectory, contentType, `${slug}.mdx`);

        if (!fs.existsSync(fullPath)) return null;

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug,
            frontmatter: data as MdxFrontmatter,
            content,
        };
    } catch (e) {
        console.error(`Error reading MDX post ${slug}:`, e);
        return null;
    }
}

export async function getAllPosts(contentType: string = 'literature'): Promise<MdxPost[]> {
    const typeDirectory = path.join(contentDirectory, contentType);
    ensureDirectoryExists(typeDirectory);

    try {
        const filenames = fs.readdirSync(typeDirectory);

        const posts = filenames
            .filter((filename) => filename.endsWith('.mdx'))
            .map((filename) => {
                const slug = filename.replace(/\.mdx$/, '');
                const fullPath = path.join(typeDirectory, filename);
                const fileContents = fs.readFileSync(fullPath, 'utf8');
                const { data } = matter(fileContents);

                return {
                    slug,
                    frontmatter: data as MdxFrontmatter,
                    content: '', // Avoid loading full content for lists
                };
            })
            // Sort posts by date in descending order
            .sort((a, b) => (new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()));

        return posts;
    } catch (e) {
        console.error(`Error reading all MDX posts for ${contentType}:`, e);
        return [];
    }
}

export async function serializeMdx(content: string) {
    return await serialize(content, {
        mdxOptions: {
            development: process.env.NODE_ENV === 'development',
        },
    });
}
