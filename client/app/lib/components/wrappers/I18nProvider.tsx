import { ReactNode, useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import {
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
} from 'lib/constants/sharedConstants';
import { useI18nConfig } from 'lib/hooks/session';
import moment from 'lib/moment';

import translations from '../../../../build/locales/locales.json';

interface I18nProviderProps {
  children: ReactNode;
}

const getLocaleWithoutRegionCode = (locale: string): string =>
  locale.toLowerCase().split(/[_-]+/)[0];

const getMessages = (locale: string): Record<string, string> | undefined => {
  const localeWithoutRegionCode = getLocaleWithoutRegionCode(locale);

  return localeWithoutRegionCode !== DEFAULT_LOCALE
    ? translations[localeWithoutRegionCode] || translations[locale]
    : undefined;
};

const I18nProvider = (props: I18nProviderProps): JSX.Element => {
  const { locale, timeZone } = useI18nConfig();

  useEffect(() => {
    moment.tz.setDefault(timeZone?.trim() || DEFAULT_TIME_ZONE);
  }, [timeZone]);

  return (
    <IntlProvider
      defaultLocale={DEFAULT_LOCALE}
      locale={locale}
      messages={getMessages(locale)}
      textComponent="span"
    >
      {props.children}
    </IntlProvider>
  );
};

export default I18nProvider;
