
const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-[#020617]': 'bg-white',
  'bg-slate-950': 'bg-slate-50',
  'bg-slate-900': 'bg-white',
  'bg-slate-800': 'bg-slate-100',
  'bg-slate-700': 'bg-slate-200',
  'border-slate-800': 'border-slate-200',
  'border-slate-700': 'border-slate-300',
  'border-slate-600': 'border-slate-400',
  'text-slate-100': 'text-slate-900',
  'text-slate-200': 'text-slate-800',
  'text-slate-300': 'text-slate-700',
  'text-slate-400': 'text-slate-600',
  'text-white': 'text-slate-900',
  'bg-white/10': 'bg-black/5',
  'bg-white/5': 'bg-black/5',
  'hover:bg-white/10': 'hover:bg-black/10',
  'cyan-400': 'orange-400',
  'cyan-500': 'orange-500',
  'blue-400': 'orange-400',
  'blue-500': 'orange-500',
  'blue-600': 'orange-600'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('C:\\\\Users\\\\S\\\\MineCraft-Website\\\\frontend\\\\src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    for (const [key, value] of Object.entries(replacements)) {
      // Use regex with word boundaries where appropriate, but class names have hyphens
      // We can use a simple replaceAll for class-like strings
      newContent = newContent.split(key).join(value);
    }
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('Updated', filePath);
    }
  }
});
