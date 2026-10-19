import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, getIntlLocale, isSupportedLanguage } from '@/i18n/languages';

/** Current language code and the matching Intl locale for formatting money and dates. */
export function useLocale() {
  const { i18n } = useTranslation();
  const language = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;

  return { language, intlLocale: getIntlLocale(language) };
}
