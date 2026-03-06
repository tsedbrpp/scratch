const { execSync } = require('child_process');
const fs = require('fs');

try {
    // Capture tsc output explicitly in utf8
    let tscOutput = '';
    try {
        tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        tscOutput = e.stdout.toString();
    }

    // Save as clean utf8
    fs.writeFileSync('clean-tsc-errors.txt', tscOutput, 'utf8');

    // Tally top files with errors
    const lines = tscOutput.split('\n');
    const files = {};
    for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_\-\./\\]+\.tsx?)\(/);
        if (match) {
            files[match[1]] = (files[match[1]] || 0) + 1;
        }
    }

    const sorted = Object.entries(files).sort((a, b) => b[1] - a[1]).slice(0, 10);
    console.log("TOP FILES WITH TSC ERRORS:");
    console.log(sorted);
} catch (err) {
    console.error(err);
}
