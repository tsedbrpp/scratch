const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = ['node_modules', '.next', '.git', '.vercel', '.idea', '.agent'];
const INCLUDED_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.css'];

function countLines(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.split('\n').length;
    } catch (err) {
        return 0;
    }
}

function walkDir(dir, stats = { totalFiles: 0, totalLines: 0, byExt: {} }) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                walkDir(fullPath, stats);
            }
        } else {
            const ext = path.extname(file);
            if (INCLUDED_EXTS.includes(ext)) {
                const lines = countLines(fullPath);
                stats.totalFiles++;
                stats.totalLines += lines;
                stats.byExt[ext] = stats.byExt[ext] || { files: 0, lines: 0 };
                stats.byExt[ext].files++;
                stats.byExt[ext].lines += lines;
            }
        }
    }
    return stats;
}

const targetDir = process.argv[2] || '.';
const results = walkDir(targetDir);
console.log(JSON.stringify(results, null, 2));
