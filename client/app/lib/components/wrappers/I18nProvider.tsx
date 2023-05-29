import { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

import { i18nLocale } from 'lib/helpers/server-context';

import translations from '../../../../build/locales/locales.json';

interface I18nProviderProps {
  children: ReactNode;
}

const I18nProvider = (props: I18nProviderProps): JSX.Element => {
  if (!i18nLocale) throw new Error(`Illegal i18nLocale: ${i18nLocale}`);

  const localeWithoutRegionCode = i18nLocale.toLowerCase().split(/[_-]+/)[0];

  let messages;
  if (localeWithoutRegionCode !== 'en') {
    messages =
      translations[localeWithoutRegionCode] || translations[i18nLocale];
  }

  return (
    <IntlProvider locale={i18nLocale} messages={messages} textComponent="span">
      {props.children}
    </IntlProvider>
  );
};

export default I18nProvider;
