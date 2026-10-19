import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from './languages';
import de from './locales/de.json';
import en from './locales/en.json';
import fi from './locales/fi.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';

export const resources = {
  en: { translation: en },
  fi: { translation: fi },
  ru: { translation: ru },
  de: { translation: de },
  fr: { translation: fr },
} as const;

// Registered before init so the <html lang> attribute is also set for the initial language.
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    // "fi-FI" from the browser is treated as "fi".
    load: 'languageOnly',
    // Translations are bundled, so initialise synchronously (no loading flicker).
    initAsync: false,
    interpolation: {
      // React already escapes values.
      escapeValue: false,
    },
    detection: {
      // 1. the language the user picked before, 2. the browser language.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'atp.language',
      caches: ['localStorage'],
    },
  });

export default i18n;
