import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { isSupportedLanguage, SUPPORTED_LANGUAGES } from '@/i18n/languages';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const { language } = useLocale();
  const selectId = useId();

  function handleChange(code: string) {
    if (isSupportedLanguage(code)) {
      // The detector saves the choice to localStorage automatically.
      void i18n.changeLanguage(code);
    }
  }

  return (
    <div className={styles.switcher}>
      <label htmlFor={selectId} className="visually-hidden">
        {t('language.label')}
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={language}
        onChange={(event) => handleChange(event.target.value)}
      >
        {SUPPORTED_LANGUAGES.map(({ code, flag, nativeName }) => (
          <option key={code} value={code} lang={code}>
            {`${flag} ${nativeName}`}
          </option>
        ))}
      </select>
    </div>
  );
}
