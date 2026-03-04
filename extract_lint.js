const { execSync } = require('child_process');
const fs = require('fs');

try {
    const output = execSync('npx eslint src --format json', { encoding: 'utf8' });
    console.log("No lint errors found!");
} catch (error) {
    if (error.stdout) {
        try {
            const data = JSON.parse(error.stdout);
            let summary = "";
            let errorCount = 0;

            data.filter(r => r.errorCount > 0 || r.warningCount > 0).forEach(r => {
                summary += `\nFile: ${r.filePath}\n`;
                r.messages.forEach(m => {
                    summary += `  Line ${m.line}: ${m.message} (${m.ruleId})\n`;
                    errorCount++;
                });
            });

            fs.writeFileSync('lint_summary_clean.txt', summary);
            console.log(`Saved ${errorCount} lint issues to lint_summary_clean.txt`);
        } catch (parseError) {
            console.error("Failed to parse JSON output", parseError);
        }
    } else {
        console.error("Failed to run eslint", error);
    }
}
