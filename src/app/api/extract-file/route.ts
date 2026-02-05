// Polyfill Browser Globals for PDF.js (used by pdf-parse)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

if (!globalAny.DOMMatrix) {
    globalAny.DOMMatrix = class DOMMatrix {
        constructor() { }
        toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
    };
}
if (!globalAny.ImageData) {
    globalAny.ImageData = class ImageData {
        constructor() { }
    };
}
if (!globalAny.Path2D) {
    globalAny.Path2D = class Path2D {
        constructor() { }
    };
}

import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`[FILE EXTRACT] Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

        let text = "";
        const buffer = Buffer.from(await file.arrayBuffer());

        if (file.type === 'application/pdf') {
            try {
                // pdf-parse-fork is a maintained fork that works in Node.js
                const pdfParse = (await import('pdf-parse-fork')).default;
                const data = await pdfParse(buffer);
                text = data.text;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (pdfError: unknown) {
                console.error("[PDF PARSE ERROR]", pdfError);
                return NextResponse.json({ error: "Failed to parse PDF: " + pdfError.message }, { status: 500 });
            }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
            try {
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
                if (result.messages && result.messages.length > 0) {
                    console.log("[DOCX WARNINGS]:", result.messages);
                }
            } catch (docError) {
                console.error("[DOCX ERROR]", docError);
                throw new Error("Failed to parse Word document. Ensure it is a valid .docx file.");
            }
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            text = buffer.toString('utf-8');
        } else {
            return NextResponse.json({ error: "Unsupported file type. Please upload PDF, DOCX, or TXT." }, { status: 400 });
        }

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Limit length
        if (text.length > 50000) {
            text = text.substring(0, 50000) + '... (truncated)';
        }

        return NextResponse.json({ success: true, text });

    } catch (error) {
        console.error("File extraction failed:", error);
        return NextResponse.json({ error: "Failed to extract text from file" }, { status: 500 });
    }
}
