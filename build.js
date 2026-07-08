/**
   * build.js
   * Compiles the modular development files into a production-optimized dist/ folder.
   * Strips comments, minifies styles and scripts, and bundles resources.
   */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Clean and recreate dist directories
const cleanDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        cleanDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
};

cleanDir(distDir);
fs.mkdirSync(distDir);
fs.mkdirSync(path.join(distDir, 'js'));
fs.mkdirSync(path.join(distDir, 'css'));

console.log('Dist directories created.');

// 1. Minify CSS
let css = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');
// Remove comments
css = css.replace(/\/\*[\s\S]*?\*\//g, '');
// Remove newlines and excess whitespace
css = css.replace(/\s+/g, ' ');
css = css.replace(/ ?([:;{}]) ?/g, '$1');
// Remove Google Font import from CSS (since we load it via HTML link for parallelization)
css = css.replace(/@import url\(['"]https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@600;700;900&display=swap['"]\);/g, '');
fs.writeFileSync(path.join(distDir, 'css', 'style.min.css'), css);
console.log('CSS Minified.');

const stripComments = (code) => {
  let inString = false;
  let stringChar = null;
  let inRegex = false;
  let inSingleComment = false;
  let inMultiComment = false;
  let result = '';
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];
    
    if (inSingleComment) {
      if (char === '\n' || char === '\r') {
        inSingleComment = false;
        result += char;
      }
      continue;
    }
    
    if (inMultiComment) {
      if (char === '*' && nextChar === '/') {
        inMultiComment = false;
        i++;
      }
      continue;
    }
    
    if (inString) {
      result += char;
      if (char === stringChar && code[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }
    
    if (inRegex) {
      result += char;
      if (char === '/' && code[i - 1] !== '\\') {
        inRegex = false;
      }
      continue;
    }
    
    if (char === '/' && nextChar === '/') {
      inSingleComment = true;
      i++;
      continue;
    }
    if (char === '/' && nextChar === '*') {
      inMultiComment = true;
      i++;
      continue;
    }
    
    if (char === "'" || char === '"' || char === '`') {
      inString = true;
      stringChar = char;
      result += char;
      continue;
    }
    
    if (char === '/') {
      const prevText = result.trim();
      const lastChar = prevText[prevText.length - 1];
      if (!lastChar || [';', ',', '=', '(', '[', '{', ':', '?', '&', '|', '!', '+', '-', '*', '/', '%', '>', '<'].includes(lastChar) || prevText.endsWith('return') || prevText.endsWith('yield') || prevText.endsWith('throw')) {
        inRegex = true;
        result += char;
        continue;
      }
    }
    
    result += char;
  }
  return result;
};

// 2. Bundle and Minify JS
const jsFiles = [
  'config.js',
  'gemini.js',
  'simulation.js',
  'crowd.js',
  'navigation.js',
  'assistant.js',
  'decision.js',
  'app.js'
];

let bundledJs = '';
for (const file of jsFiles) {
  let js = fs.readFileSync(path.join(__dirname, 'js', file), 'utf8');
  // Strip comments using safe parser
  js = stripComments(js);
  // Normalize whitespace
  js = js.replace(/\s+/g, ' ');
  bundledJs += js + '\n';
}
fs.writeFileSync(path.join(distDir, 'js', 'app.min.js'), bundledJs);
console.log('JS Bundled & Minified.');

// 3. Process index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace CSS stylesheet link
html = html.replace(
  '<link rel="stylesheet" href="css/style.css">',
  '<link rel="stylesheet" href="css/style.min.css">'
);

// Font preconnect and manifest link are already defined in the source index.html head.

// Replace the multiple individual script tags with the single minified bundle
const scriptRegex = /<script src="js\/config\.js"><\/script>[\s\S]*?<script src="js\/app\.js"><\/script>/;
const replacementScript = `\n<script src="js/app.min.js" defer></script>\n`;
html = html.replace(scriptRegex, replacementScript);

fs.writeFileSync(path.join(distDir, 'index.html'), html);
console.log('index.html optimized.');

// 4. Copy Service Worker and Manifest
fs.copyFileSync(path.join(__dirname, 'sw.js'), path.join(distDir, 'sw.js'));
fs.copyFileSync(path.join(__dirname, 'manifest.json'), path.join(distDir, 'manifest.json'));
console.log('SW & Manifest copied.');

// 5. Copy Tests to Dist (so tests can be run headlessly or in browser on deployed Pages)
const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest);
  fs.readdirSync(src).forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};
if (fs.existsSync(path.join(__dirname, 'tests'))) {
  copyDir(path.join(__dirname, 'tests'), path.join(distDir, 'tests'));
  console.log('Tests copied.');
}

console.log('Build completed successfully!');
