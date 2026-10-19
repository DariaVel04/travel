/**
 * Checks that every locale has exactly the same translation keys as English.
 * Plural suffixes (_one, _few, _many, _other…) are ignored because each language
 * needs a different set of plural forms.
 *
 * Usage: npm run i18n:check
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES_DIR = join(import.meta.dirname, '..', 'src', 'i18n', 'locales');
const SOURCE_LOCALE = 'en';
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function collectKeys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? collectKeys(value, path)
      : [path.replace(PLURAL_SUFFIX, '')];
  });
}

function loadKeys(locale) {
  const content = JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), 'utf8'));
  return new Set(collectKeys(content));
}

const sourceKeys = loadKeys(SOURCE_LOCALE);
const locales = readdirSync(LOCALES_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace('.json', ''))
  .filter((locale) => locale !== SOURCE_LOCALE);

let hasErrors = false;

for (const locale of locales) {
  const keys = loadKeys(locale);
  const missing = [...sourceKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !sourceKeys.has(key));

  if (missing.length === 0 && extra.length === 0) {
    console.log(`✓ ${locale}: all ${sourceKeys.size} keys present`);
    continue;
  }

  hasErrors = true;
  console.error(`✗ ${locale}:`);
  missing.forEach((key) => console.error(`    missing: ${key}`));
  extra.forEach((key) => console.error(`    extra:   ${key}`));
}

process.exit(hasErrors ? 1 : 0);
