const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.match(/node_modules|\.next|\.git/)) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.match(/\.(tsx|ts|jsx|js|md|mdx|json)$/)) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let changedFiles = [];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/instantTEA/g, 'Policy Prism')
        .replace(/instantTea/g, 'Policy Prism')
        .replace(/Instanttea/g, 'Policy Prism')

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFiles.push(file);
    }
});

console.log("Updated " + changedFiles.length + " files with the lower-case 'i' variation.");
