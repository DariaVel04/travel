/**
 * Supported languages. To add a new language:
 * 1. add an entry here,
 * 2. create src/i18n/locales/<code>.json,
 * 3. register it in src/i18n/index.ts,
 * 4. run `npm run i18n:check`.
 *
 * Native names and flags are shown as-is in every UI language, so they are not translated.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', nativeName: 'English', flag: '🇬🇧', intlLocale: 'en-GB' },
  { code: 'fi', nativeName: 'Suomi', flag: '🇫🇮', intlLocale: 'fi-FI' },
  { code: 'ru', nativeName: 'Русский', flag: '🇷🇺', intlLocale: 'ru-RU' },
  { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪', intlLocale: 'de-DE' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷', intlLocale: 'fr-FR' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const SUPPORTED_LANGUAGE_CODES: LanguageCode[] = SUPPORTED_LANGUAGES.map(
  (language) => language.code,
);

export function isSupportedLanguage(value: string | undefined): value is LanguageCode {
  return SUPPORTED_LANGUAGE_CODES.some((code) => code === value);
}

/** Locale used by Intl for numbers, currencies and dates, e.g. "fi-FI". */
export function getIntlLocale(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES.find((language) => language.code === code)?.intlLocale ?? 'en-GB';
}
