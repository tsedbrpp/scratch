export interface PDFExtractionResult {
    text: string;
    pageCount: number;
    metadata?: any;
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
    try {
        // Dynamic import to avoid SSR issues with DOMMatrix
        const pdfjsLib = await import('pdfjs-dist');

        // Configure worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();

        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const pageCount = pdf.numPages;
        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
        }

        // Get metadata
        const metadata = await pdf.getMetadata();

        return {
            text: fullText.trim(),
            pageCount,
            metadata: metadata.info
        };
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export function segmentText(text: string, chunkSize: number = 2000): string[] {
    const segments: string[] = [];
    const words = text.split(/\s+/);

    let currentSegment: string[] = [];
    let currentLength = 0;

    for (const word of words) {
        if (currentLength + word.length > chunkSize && currentSegment.length > 0) {
            segments.push(currentSegment.join(' '));
            currentSegment = [word];
            currentLength = word.length;
        } else {
            currentSegment.push(word);
            currentLength += word.length + 1;
        }
    }

    if (currentSegment.length > 0) {
        segments.push(currentSegment.join(' '));
    }

    return segments;
}
