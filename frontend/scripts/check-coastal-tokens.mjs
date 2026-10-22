import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const expected = {
  '--color-bg': '#0b1026',
  '--color-surface': '#141a36',
  '--color-surface-muted': '#1b2244',
  '--color-text': '#eef0ff',
  '--color-text-muted': '#9aa0c3',
  '--color-border': '#262e57',
  '--color-border-strong': '#343d6e',
  '--color-primary': '#6d5efc',
  '--color-primary-hover': '#5a4ae8',
  '--color-primary-soft': '#252a63',
  '--color-primary-text': '#b3aaff',
  '--color-on-primary': '#ffffff',
  '--color-hero': '#0b1026',
  '--color-on-hero': '#ffffff',
  '--color-focus': '#8b7fff',
};

const failures = [];

for (const [name, value] of Object.entries(expected)) {
  const pattern = new RegExp(`${name}:\\s*${value}\\s*;`);
  if (!pattern.test(tokens)) failures.push(`${name} is not ${value}`);
}

if (!tokens.includes('--font-display:')) {
  failures.push('missing --font-display');
}
if (!tokens.includes('color-scheme: dark')) {
  failures.push('tokens do not declare color-scheme: dark');
}
if (!html.includes('family=Inter')) {
  failures.push('index.html does not load Inter');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('night theme tokens ok');
