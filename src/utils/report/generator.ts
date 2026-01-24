import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { STYLE } from "./styles";
import { sanitizeText } from "./helpers";

export class ReportGeneratorDOCX {
    public sections: any[] = [];

    constructor() { }

    public getDocument(): Document {
        return new Document({
            sections: [{
                properties: {},
                children: this.sections,
            }],
            styles: {
                paragraphStyles: [
                    {
                        id: "Normal",
                        name: "Normal",
                        run: {
                            font: "Helvetica",
                            size: 22, // 11pt
                            color: "000000",
                        },
                        paragraph: {
                            spacing: { line: 276, before: 0, after: 0 }, // 1.15 line height
                        },
                    },
                ],
            },
        });
    }

    public addTitlePage(title: string, subtitle: string) {
        this.sections.push(
            new Paragraph({
                text: title,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { before: 4000, after: 300 },
                run: {
                    font: STYLE.fonts.header,
                    color: STYLE.colors.primary,
                    size: STYLE.sizes.title,
                    bold: true,
                }
            })
        );

        this.sections.push(
            new Paragraph({
                text: subtitle,
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                run: {
                    font: STYLE.fonts.normal,
                    color: STYLE.colors.meta,
                    size: STYLE.sizes.subHeader,
                }
            })
        );

        const dateStr = `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
        this.sections.push(
            new Paragraph({
                text: dateStr,
                alignment: AlignmentType.CENTER,
                run: {
                    font: STYLE.fonts.normal,
                    color: STYLE.colors.meta,
                    size: STYLE.sizes.body,
                }
            })
        );
    }

    public addPageBreak() {
        this.sections.push(new Paragraph({
            children: [new TextRun({ break: 1 })],
            pageBreakBefore: true
        }));
    }

    public addSectionHeader(title: string, pageBreak: boolean = false) {
        this.sections.push(
            new Paragraph({
                text: title.toUpperCase(),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 300, after: 150 },
                pageBreakBefore: pageBreak,
                run: {
                    font: STYLE.fonts.header,
                    color: STYLE.colors.primary,
                    size: STYLE.sizes.section,
                    bold: true,
                },
                border: {
                    bottom: { color: STYLE.colors.accent, space: 1, style: BorderStyle.SINGLE, size: 12 }
                }
            })
        );
    }

    public addSubHeader(title: string) {
        this.sections.push(
            new Paragraph({
                text: title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                run: {
                    font: STYLE.fonts.header,
                    color: STYLE.colors.primary,
                    size: STYLE.sizes.subHeader,
                    bold: true,
                }
            })
        );
    }

    public addText(text: string | null | undefined, color: string = STYLE.colors.text, indent: number = 0, bold: boolean = false) {
        if (!text) return;

        const cleanContent = sanitizeText(text);
        const paragraphs = cleanContent.split('\n');

        paragraphs.forEach(p => {
            let content = p.trim();
            if (!content) return;

            const isBullet = content.startsWith("•");
            if (isBullet) {
                content = content.replace(/^[•\s]+/, "").trim();
            }

            this.sections.push(
                new Paragraph({
                    text: content,
                    bullet: isBullet ? { level: 0 } : undefined,
                    indent: isBullet ? undefined : { left: indent * 100 },
                    spacing: { after: 120 },
                    run: {
                        font: STYLE.fonts.normal,
                        color: color,
                        size: STYLE.sizes.body,
                        bold: bold,
                    }
                })
            );
        });
    }

    public addSpacer() {
        this.sections.push(new Paragraph({ text: "" }));
    }

    public addImage(base64Data: string, width: number = 600, height: number = 400, caption?: string) {
        if (!base64Data) return;

        // Strip prefix if present (e.g. "data:image/png;base64,")
        const data = base64Data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

        try {
            const image = new ImageRun({
                data: data,
                transformation: {
                    width: width,
                    height: height,
                },
                type: "png", // docx seems to auto-detect or default to png/jpeg based on header usually, but explicit type helps
            });

            this.sections.push(
                new Paragraph({
                    children: [image],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 100 },
                })
            );

            if (caption) {
                this.sections.push(
                    new Paragraph({
                        text: caption,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                        run: {
                            font: STYLE.fonts.normal,
                            color: STYLE.colors.meta,
                            size: STYLE.sizes.meta, // 9pt
                            italics: true,
                        }
                    })
                );
            }

        } catch (e) {
            console.error("Failed to add image to report:", e);
            this.sections.push(
                new Paragraph({
                    text: "[Error: Could not render image]",
                    run: { color: STYLE.colors.danger, italics: true }
                })
            );
        }
    }

    public async generateAndDownload(filename: string) {
        const doc = new Document({
            sections: [{
                properties: {},
                children: this.sections,
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, filename);
    }
}
