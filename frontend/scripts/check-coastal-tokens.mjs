import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const expected = {
  '--color-bg': '#f4efe6',
  '--color-surface': '#fffdf8',
  '--color-surface-muted': '#f4efe6',
  '--color-text': '#1c1915',
  '--color-text-muted': '#6b6258',
  '--color-border': '#e4d9c8',
  '--color-border-strong': '#d7cbb8',
  '--color-primary': '#1f6f5b',
  '--color-primary-hover': '#184f42',
  '--color-primary-soft': '#e5f2ed',
  '--color-on-primary': '#ffffff',
  '--color-hero': '#16382f',
  '--color-hero-from': '#16382f',
  '--color-hero-to': '#1f6f5b',
  '--color-on-hero': '#f6f1e7',
  '--color-focus': '#1f6f5b',
};

const failures = [];

for (const [name, value] of Object.entries(expected)) {
  const pattern = new RegExp(`${name}:\\s*${value}\\s*;`);
  if (!pattern.test(tokens)) failures.push(`${name} is not ${value}`);
}

if (!tokens.includes('--font-serif:')) {
  failures.push('missing --font-serif');
}
if (!tokens.includes('Source Serif 4')) {
  failures.push('--font-serif does not name Source Serif 4');
}
if (!html.includes('Source+Serif+4')) {
  failures.push('index.html does not load Source Serif 4');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('coastal tokens ok');
