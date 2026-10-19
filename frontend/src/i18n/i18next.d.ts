import 'i18next';
import type en from './locales/en.json';

/**
 * English is the source of truth for translation keys.
 * With this declaration, t('some.missing.key') is a TypeScript error.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
