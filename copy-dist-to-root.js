// Copy built files from dist/ to root for GitHub Pages
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCopy = ['index.html', 'assets', 'logo.jpg'];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, 'dist', file);
  const dest = path.join(__dirname, file);
  
  if (fs.existsSync(src)) {
    const stat = fs.lstatSync(src);
    if (stat.isDirectory()) {
      // Copy directory
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true });
      }
      fs.cpSync(src, dest, { recursive: true });
      console.log(`Copied directory: ${file}`);
    } else {
      // Copy file
      fs.copyFileSync(src, dest);
      console.log(`Copied file: ${file}`);
    }
  } else {
    console.log(`Skipping (not found): ${file}`);
  }
});

console.log('Done! Files copied to root for GitHub Pages.');

