const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageNumber, NumberFormat, convertInchesToTwip
} = require("docx");

const md = fs.readFileSync(path.join(__dirname, "..", "manuscript_final.md"), "utf-8");
const lines = md.split(/\r?\n/);

// ── Styles ──
const FONT = "Times New Roman";
const FONT_SIZE = 24; // 12pt in half-points
const HEADING_FONT = "Times New Roman";
const LINE_SPACING = 480; // double-spaced (twips: 240 = single)

function makeRun(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.font || FONT,
    size: opts.size || FONT_SIZE,
    bold: opts.bold || false,
    italics: opts.italics || false,
  });
}

function parseInlineFormatting(text) {
  // Parse bold, italic, and bold-italic markdown inline formatting
  const runs = [];
  // Split on bold-italic, bold, italic patterns
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add preceding plain text
    if (match.index > lastIndex) {
      runs.push(makeRun(text.slice(lastIndex, match.index)));
    }
    if (match[2]) {
      // bold-italic ***text***
      runs.push(makeRun(match[2], { bold: true, italics: true }));
    } else if (match[3]) {
      // bold **text**
      runs.push(makeRun(match[3], { bold: true }));
    } else if (match[4] || match[5]) {
      // italic *text* or _text_
      runs.push(makeRun(match[4] || match[5], { italics: true }));
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    runs.push(makeRun(text.slice(lastIndex)));
  }
  if (runs.length === 0) {
    runs.push(makeRun(text));
  }
  return runs;
}

function makeHeading(text, level) {
  const headingLevel = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
  }[level] || HeadingLevel.HEADING_4;

  const sizes = { 1: 32, 2: 28, 3: 26, 4: 24 };

  return new Paragraph({
    heading: headingLevel,
    spacing: { before: 240, after: 120, line: LINE_SPACING },
    children: [
      makeRun(text.replace(/^#+\s*/, ""), {
        bold: true,
        size: sizes[level] || 24,
        font: HEADING_FONT,
      }),
    ],
  });
}

function makeBodyParagraph(text, indent = false) {
  return new Paragraph({
    spacing: { after: 120, line: LINE_SPACING },
    indent: indent ? { left: convertInchesToTwip(0.5) } : undefined,
    children: parseInlineFormatting(text),
  });
}

function makeBlockquote(text) {
  return new Paragraph({
    spacing: { after: 60, line: LINE_SPACING },
    indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
    children: parseInlineFormatting(text.replace(/^>\s*/, "")),
  });
}

function makeListItem(text, ordered, num) {
  const prefix = ordered ? `${num}. ` : "• ";
  const cleanText = text.replace(/^\d+\.\s*/, "").replace(/^[-*]\s*/, "");
  return new Paragraph({
    spacing: { after: 60, line: LINE_SPACING },
    indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
    children: [makeRun(prefix), ...parseInlineFormatting(cleanText)],
  });
}

function parseTableRow(line) {
  return line.split("|").slice(1, -1).map(c => c.trim());
}

function isTableSeparator(line) {
  return /^\|[\s:-]+\|/.test(line);
}

function buildTable(headerCells, rows) {
  const noBorder = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  function makeCell(text, isHeader) {
    return new TableCell({
      borders,
      width: { size: Math.floor(100 / headerCells.length), type: WidthType.PERCENTAGE },
      shading: isHeader ? { type: ShadingType.SOLID, color: "E8E8E8" } : undefined,
      children: [
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: parseInlineFormatting(text),
        }),
      ],
    });
  }

  const tableRows = [
    new TableRow({ children: headerCells.map(c => makeCell(c, true)) }),
    ...rows.map(r => new TableRow({ children: r.map(c => makeCell(c, false)) })),
  ];

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ── Parse markdown into docx elements ──
const elements = [];
let i = 0;
let listCounter = 0;

// Title page
elements.push(new Paragraph({ spacing: { before: 2400 } }));
elements.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 480, line: LINE_SPACING },
  children: [makeRun("Tracing Structural Absence in Algorithmic Governance:", { bold: true, size: 36, font: HEADING_FONT })],
}));
elements.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 480, line: LINE_SPACING },
  children: [makeRun("Policy Prism as an Interpretive Artifact", { bold: true, size: 36, font: HEADING_FONT })],
}));
elements.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 240, line: LINE_SPACING },
  children: [makeRun("[Author Name]", { size: 28, font: HEADING_FONT })],
}));
elements.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 240, line: LINE_SPACING },
  children: [makeRun("[Institutional Affiliation]", { size: 24, font: HEADING_FONT, italics: true })],
}));
elements.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 240, line: LINE_SPACING },
  children: [makeRun("Submitted to Information & Organization", { size: 24, font: HEADING_FONT, italics: true })],
}));
elements.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 240, line: LINE_SPACING },
  children: [makeRun("Special Issue: Algorithmic Assemblages—Fields, Ecosystems, and Platforms", { size: 22, font: HEADING_FONT, italics: true })],
}));
elements.push(new Paragraph({ spacing: { after: 600 } }));

// Skip the markdown title line
while (i < lines.length) {
  const line = lines[i];

  // Skip the first H1 (title) — already rendered above
  if (i === 0 && line.startsWith("# ")) { i++; continue; }

  // Empty lines
  if (line.trim() === "") { i++; continue; }

  // Figure/insert placeholders
  if (line.trim().startsWith("*(Insert")) {
    elements.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240, line: LINE_SPACING },
      shading: { type: ShadingType.SOLID, color: "F0F0F0" },
      children: [makeRun(line.trim().replace(/^\*\(/, "[").replace(/\)\*$/, "]"), { italics: true })],
    }));
    i++;
    continue;
  }

  // Headings
  const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
  if (headingMatch) {
    elements.push(makeHeading(headingMatch[2], headingMatch[1].length));
    i++;
    continue;
  }

  // Blockquote (> Note: ...)
  if (line.startsWith("> ")) {
    elements.push(makeBlockquote(line));
    i++;
    continue;
  }

  // Tables
  if (line.startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
    const headerCells = parseTableRow(line);
    i += 2; // skip header + separator
    const rows = [];
    while (i < lines.length && lines[i].startsWith("|")) {
      rows.push(parseTableRow(lines[i]));
      i++;
    }
    elements.push(new Paragraph({ spacing: { before: 120 } }));
    elements.push(buildTable(headerCells, rows));
    elements.push(new Paragraph({ spacing: { after: 120 } }));
    continue;
  }

  // Ordered list
  if (/^\d+\.\s/.test(line)) {
    listCounter++;
    elements.push(makeListItem(line, true, listCounter));
    i++;
    continue;
  } else {
    listCounter = 0;
  }

  // Unordered list
  if (/^[-*]\s/.test(line)) {
    elements.push(makeListItem(line, false, 0));
    i++;
    continue;
  }

  // Regular paragraph
  elements.push(makeBodyParagraph(line));
  i++;
}

// ── Build document ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: FONT_SIZE },
        paragraph: { spacing: { line: LINE_SPACING } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                makeRun("Policy Prism — I&O Submission", { size: 18, italics: true }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT,
                  size: 20,
                }),
              ],
            }),
          ],
        }),
      },
      children: elements,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, "..", "manuscript_final.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Word document generated: ${outPath}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
