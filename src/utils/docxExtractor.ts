import mammoth from 'mammoth';

export interface DOCXExtractionResult {
    text: string;
    messages: string[]; // Warnings or info from mammoth
}

export async function extractTextFromDOCX(file: File): Promise<DOCXExtractionResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // Convert ArrayBuffer to Buffer node style if needed, but mammoth in browser supports arrayBuffer directly usually?
        // Mammoth browser support expects arrayBuffer.

        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });

        return {
            text: result.value.trim(),
            messages: result.messages.map(m => m.message)
        };
    } catch (error) {
        console.error('DOCX extraction error:', error);
        throw new Error('Failed to extract text from Word document');
    }
}
