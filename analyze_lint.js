const { exec } = require('child_process');

console.log("Running lint...");
exec('npm run lint src/components -- --format json', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    try {
        const jsonStart = stdout.indexOf('[');
        if (jsonStart === -1) throw new Error("No JSON array found in stdout");
        const jsonContent = stdout.substring(jsonStart);
        const report = JSON.parse(jsonContent);

        const files = report.map(f => ({
            path: f.filePath,
            errors: f.errorCount,
            warnings: f.warningCount
        })).sort((a, b) => b.errors - a.errors);

        console.log("Top 10 files with errors:");
        files.slice(0, 10).forEach(f => {
            console.log(`${f.errors} errors, ${f.warnings} warnings: ${f.path}`);
        });
    } catch (e) {
        console.error("Failed to parse report:", e);
        console.error("Stdout start:", stdout.substring(0, 100));
    }
});
