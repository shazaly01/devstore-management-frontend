const fs = require('fs');
const path = require('path');

// مجلدات يتم استبعادها
const ignored = ['.git', 'node_modules', 'dist', 'build', '.vscode', '.idea'];

function buildTree(dir, prefix = '') {
    let output = '';
    let files = [];
    try {
        files = fs.readdirSync(dir).filter(f => !ignored.includes(f));
    } catch (e) {
        return '';
    }

    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                output += `${prefix}├── [DIR] ${file}\n`;
                output += buildTree(fullPath, prefix + '│   ');
            } else {
                output += `${prefix}├── ${file}\n`;
            }
        } catch (e) {}
    }
    return output;
}

const currentDir = process.cwd();
let result = '============ [ CONFIG & ROOT FILES ] ============\n';

// فحص أهم ملفات الإعداد والستايل (Tailwind / Vite / Vue)
const configFiles = [
    'package.json',
    'tailwind.config.js',
    'tailwind.config.cjs',
    'tailwind.config.ts',
    'vite.config.js',
    'vite.config.ts',
    'index.html'
];

configFiles.forEach(cfg => {
    if (fs.existsSync(path.join(currentDir, cfg))) {
        result += `├── ${cfg}\n`;
    }
});
result += '\n';

// فحص مجلد src
const srcDir = path.join(currentDir, 'src');
if (fs.existsSync(srcDir)) {
    result += '============ [ SRC FOLDER ] ============\n';
    result += buildTree(srcDir);
} else {
    result += '============ [ PROJECT ROOT ] ============\n';
    result += buildTree(currentDir);
}

fs.writeFileSync('frontend_tree.txt', result, 'utf8');
console.log('اكتمل الأمر بنجاح! الملف الناتج هو: frontend_tree.txt');