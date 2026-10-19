import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Sets a localized browser tab title: "Flights · AI Travel Planner". */
export function useDocumentTitle(pageTitle?: string) {
  const { t } = useTranslation();
  const appName = t('app.name');

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${appName}` : appName;
  }, [pageTitle, appName]);
}
