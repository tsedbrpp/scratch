import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Calendar, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// 1. Tell Next.js to statically generate all known blog post routes at build time
export async function generateStaticParams() {
    const posts = await getAllPosts("literature");

    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// 2. Dynamically generate SEO metadata based on the specific article frontmatter
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const p = await params;
    const post = await getPostBySlug("literature", p.slug);

    if (!post) {
        return {
            title: "Article Not Found",
        };
    }

    return {
        title: `${post.frontmatter.title} | InstantTea Literature`,
        description: post.frontmatter.description,
        openGraph: {
            title: post.frontmatter.title,
            description: post.frontmatter.description,
            type: "article",
            publishedTime: post.frontmatter.date,
            authors: post.frontmatter.author ? [post.frontmatter.author] : undefined,
        },
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const p = await params;
    const post = await getPostBySlug("literature", p.slug);

    if (!post) {
        return notFound();
    }

    // Convert Markdown string to React components

    return (
        <article className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Link
                href="/literature"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Literature Hub
            </Link>

            <header className="mb-10 lg:mb-14">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                    {post.frontmatter.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-b border-slate-200 pb-8">
                    <div className="flex items-center">
                        <Calendar className="mr-1.5 h-4 w-4 text-slate-400" />
                        <time dateTime={post.frontmatter.date}>
                            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                    {post.frontmatter.author && (
                        <>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center">
                                <User className="mr-1.5 h-4 w-4 text-slate-400" />
                                <span>{post.frontmatter.author}</span>
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl">
                <MDXRemote source={post.content} />
            </div>
        </article>
    );
}
