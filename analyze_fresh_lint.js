const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lint_fresh.json', 'utf8'));

const srcReport = report.filter(f => f.filePath.includes('\\src\\') || f.filePath.includes('/src/'));

const files = srcReport.map(f => ({
    path: f.filePath.split('scratch')[1] || f.filePath,
    errors: f.errorCount,
    warnings: f.warningCount,
    messages: f.messages
})).sort((a, b) => b.errors - a.errors || b.warnings - a.warnings);

console.log("Top 20 files in src/ with issues:");
files.slice(0, 20).forEach(f => {
    console.log(`${f.errors} errors, ${f.warnings} warnings: ${f.path}`);
});

// Summarize common rule violations
const ruleCounts = {};
srcReport.forEach(f => {
    f.messages.forEach(m => {
        ruleCounts[m.ruleId] = (ruleCounts[m.ruleId] || 0) + 1;
    });
});

console.log("\nCommon Rule Violations in src/:");
Object.entries(ruleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([rule, count]) => console.log(`${count}: ${rule}`));
