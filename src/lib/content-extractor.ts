import * as cheerio from 'cheerio';
// Removed top-level import to avoid build errors with CommonJS module
// import pdfParse from 'pdf-parse'; 

interface ExtractedContent {
    text: string;
    title: string;
    type: 'pdf' | 'html';
    contentLength: number;
}

export class ContentExtractor {
    /**
     * Extracts text content and title from a fetch Response object.
     * Automatically handles PDF extraction if Content-Type matches.
     */
    static async extract(response: Response, url: string): Promise<ExtractedContent> {
        const contentType = response.headers.get('content-type') || '';
        console.log(`[ContentExtractor] Extracting content from ${url}, Content-Type: ${contentType}`);

        let text = '';
        let title = '';
        let type: 'pdf' | 'html' = 'html';

        if (contentType.includes('application/pdf')) {
            console.log(`[ContentExtractor] Detected PDF`);
            type = 'pdf';
            const buffer = await response.arrayBuffer();

            // pdf-parse-fork is a maintained fork that works in Node.js
            const pdfParse = (await import('pdf-parse-fork')).default;
            const data = await pdfParse(Buffer.from(buffer));
            text = data.text;
            title = url.split('/').pop() || 'PDF Document'; // Fallback title
        } else {
            type = 'html';
            const html = await response.text();
            const $ = cheerio.load(html);

            // Remove scripts, styles, and other non-content elements
            $('script, style, noscript, iframe, svg, header, footer, nav').remove();

            // Extract title
            title = $('title').text().trim() || url;

            // Extract text content
            // We look for main content areas first, or fall back to body
            const contentSelector = 'main, article, #content, .content, body';
            text = $(contentSelector).first().text();
        }

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Limit text length to avoid overwhelming the analysis
        const maxLength = 50000;
        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '... (truncated)';
        }

        console.log(`[ContentExtractor] Extracted ${text.length} chars. Title: ${title}`);

        return {
            text,
            title,
            type,
            contentLength: text.length
        };
    }
}
