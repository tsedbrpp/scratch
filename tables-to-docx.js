const fs = require('fs');
const docx = require('docx');

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, convertInchesToTwip, ShadingType
} = docx;

const md = fs.readFileSync('tables-for-publication.md', 'utf-8');
const lines = md.split('\n');

const children = [];
let inTable = false;
let tableRows = [];

function parseInlineFormatting(text, opts = {}) {
  const runs = [];
  const baseSize = opts.size || 20;
  const baseBold = opts.bold || false;
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, size: baseSize, font: 'Times New Roman' }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], bold: true, size: baseSize, font: 'Times New Roman' }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true, size: baseSize, font: 'Times New Roman' }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5], italics: true, size: baseSize, font: 'Times New Roman' }));
    } else if (match[6]) {
      runs.push(new TextRun({ text: match[6], bold: baseBold, size: baseSize, font: 'Times New Roman' }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text, size: baseSize, font: 'Times New Roman', bold: baseBold })];
}

function flushTable() {
  if (tableRows.length === 0) return;

  const rows = tableRows.map((cells, rowIdx) => {
    return new TableRow({
      tableHeader: rowIdx === 0,
      children: cells.map(cell => new TableCell({
        width: { size: Math.floor(100 / cells.length), type: WidthType.PERCENTAGE },
        shading: rowIdx === 0 ? { type: ShadingType.SOLID, color: 'D9E2F3', fill: 'D9E2F3' } : undefined,
        children: [new Paragraph({
          children: parseInlineFormatting(cell.trim(), { size: 18, bold: rowIdx === 0 }),
          spacing: { before: 30, after: 30 }
        })]
      }))
    });
  });

  children.push(new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  }));
  children.push(new Paragraph({ spacing: { after: 200 } }));
  tableRows = [];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Table detection
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
      continue;
    }
    const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
    if (!inTable) {
      inTable = true;
      tableRows = [];
    }
    tableRows.push(cells);
    continue;
  } else if (inTable) {
    inTable = false;
    flushTable();
  }

  // Horizontal rules
  if (/^---+$/.test(trimmed)) {
    children.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
    continue;
  }

  // Headings
  if (trimmed.startsWith('## ')) {
    children.push(new Paragraph({
      children: [new TextRun({ text: trimmed.replace(/^## /, ''), size: 24, bold: true, font: 'Times New Roman' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 120 }
    }));
    continue;
  }

  // Empty lines
  if (trimmed === '') continue;

  // Regular paragraph (table titles, etc.)
  children.push(new Paragraph({
    children: parseInlineFormatting(trimmed, { size: 20 }),
    spacing: { before: 100, after: 100 }
  }));
}

if (inTable) flushTable();

const doc = new Document({
  creator: 'PolicyPrism Research Team',
  title: 'PolicyPrism — Relationship Types and Ghost Node Detection Tables',
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          right: convertInchesToTwip(0.75),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(0.75)
        }
      }
    },
    children: children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('tables-for-publication.docx', buffer);
  console.log('DOCX created: tables-for-publication.docx');
});
