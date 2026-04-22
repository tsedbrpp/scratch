const fs = require('fs');
const docx = require('docx');

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, convertInchesToTwip
} = docx;

const md = fs.readFileSync('manuscript-reduced.md', 'utf-8');
const lines = md.split('\n');

const children = [];
let inTable = false;
let tableRows = [];
let tableHeaders = [];

function flushTable() {
  if (tableRows.length === 0) return;
  const rows = tableRows.map((cells, rowIdx) => {
    return new TableRow({
      tableHeader: rowIdx === 0,
      children: cells.map(cell => new TableCell({
        width: { size: Math.floor(100 / cells.length), type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [new TextRun({
            text: cell.trim(),
            bold: rowIdx === 0,
            size: 20,
            font: 'Times New Roman'
          })],
          spacing: { before: 40, after: 40 }
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

function parseInlineFormatting(text) {
  const runs = [];
  // Simple bold/italic parser
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) { // bold+italic
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, size: 24, font: 'Times New Roman' }));
    } else if (match[3]) { // bold
      runs.push(new TextRun({ text: match[3], bold: true, size: 24, font: 'Times New Roman' }));
    } else if (match[4]) { // italic
      runs.push(new TextRun({ text: match[4], italics: true, size: 24, font: 'Times New Roman' }));
    } else if (match[5]) { // code
      runs.push(new TextRun({ text: match[5], font: 'Courier New', size: 22 }));
    } else if (match[6]) { // plain
      runs.push(new TextRun({ text: match[6], size: 24, font: 'Times New Roman' }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text, size: 24, font: 'Times New Roman' })];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Table detection
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    // Check if separator row
    if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
      continue; // skip separator
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

  // Headings
  if (trimmed.startsWith('# ') && !trimmed.startsWith('##')) {
    children.push(new Paragraph({
      children: [new TextRun({ text: trimmed.replace(/^# /, ''), size: 32, bold: true, font: 'Times New Roman' })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 }
    }));
    continue;
  }
  if (trimmed.startsWith('## ')) {
    children.push(new Paragraph({
      children: [new TextRun({ text: trimmed.replace(/^## /, ''), size: 28, bold: true, font: 'Times New Roman' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 160 }
    }));
    continue;
  }
  if (trimmed.startsWith('### ')) {
    children.push(new Paragraph({
      children: [new TextRun({ text: trimmed.replace(/^### /, ''), size: 26, bold: true, font: 'Times New Roman' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 120 }
    }));
    continue;
  }

  // Footnote-style lines
  if (/^¹/.test(trimmed)) {
    children.push(new Paragraph({
      children: [new TextRun({ text: trimmed, size: 20, italics: true, font: 'Times New Roman' })],
      spacing: { before: 80, after: 80 },
      indent: { left: convertInchesToTwip(0.5) }
    }));
    continue;
  }

  // Bullet points
  if (trimmed.startsWith('- ')) {
    const text = trimmed.replace(/^- /, '');
    children.push(new Paragraph({
      children: parseInlineFormatting(text),
      bullet: { level: 0 },
      spacing: { before: 60, after: 60 }
    }));
    continue;
  }

  // Blockquote
  if (trimmed.startsWith('> ')) {
    const text = trimmed.replace(/^> /, '');
    children.push(new Paragraph({
      children: [new TextRun({ text, italics: true, size: 24, font: 'Times New Roman' })],
      indent: { left: convertInchesToTwip(0.5) },
      spacing: { before: 80, after: 80 }
    }));
    continue;
  }

  // Empty lines
  if (trimmed === '') {
    continue;
  }

  // Regular paragraph
  children.push(new Paragraph({
    children: parseInlineFormatting(trimmed),
    spacing: { before: 120, after: 120 },
    indent: { firstLine: convertInchesToTwip(0) }
  }));
}

// Flush any remaining table
if (inTable) {
  flushTable();
}

const doc = new Document({
  creator: 'PolicyPrism Research Team',
  title: 'Policy Prism: An Interpretive Artifact for Analyzing AI Governance as an Algorithmic Assemblage',
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          right: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1)
        }
      }
    },
    children: children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('manuscript-reduced.docx', buffer);
  console.log('DOCX created: manuscript-reduced.docx');
});
