const fs = require('fs');

try {
    const raw = fs.readFileSync('lint_results.json', 'utf8');
    const data = JSON.parse(raw);

    let totalErrors = 0;
    let totalWarnings = 0;
    const rules = {};
    const filesWithAny = [];

    data.forEach(file => {
        totalErrors += file.errorCount;
        totalWarnings += file.warningCount;

        file.messages.forEach(msg => {
            if (!rules[msg.ruleId]) {
                rules[msg.ruleId] = 0;
            }
            rules[msg.ruleId]++;

            if (msg.ruleId === '@typescript-eslint/no-explicit-any' && !filesWithAny.includes(file.filePath)) {
                filesWithAny.push(file.filePath);
            }
        });
    });

    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log('\nTop Rules:');
    Object.entries(rules)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([rule, count]) => console.log(`  ${rule}: ${count}`));

    console.log(`\nFiles with 'no-explicit-any': ${filesWithAny.length}`);
    fs.writeFileSync('lint_summary.txt', filesWithAny.join('\n'));
} catch (e) {
    console.error("Error summarizing:", e);
}
