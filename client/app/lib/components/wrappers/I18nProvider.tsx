import { ReactNode, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import {
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
} from 'lib/constants/sharedConstants';
import { useI18nConfig } from 'lib/hooks/session';
import moment from 'lib/moment';

import LoadingIndicator from '../core/LoadingIndicator';

interface I18nProviderProps {
  children: ReactNode;
}

const getLocaleWithoutRegionCode = (locale: string): string =>
  locale.toLowerCase().split(/[_-]+/)[0];

const I18nProvider = (props: I18nProviderProps): JSX.Element => {
  const { locale, timeZone } = useI18nConfig();
  const [messages, setMessages] = useState<Record<string, string>>();

  useEffect(() => {
    moment.tz.setDefault(timeZone?.trim() || DEFAULT_TIME_ZONE);
  }, [timeZone]);

  const localeWithoutRegionCode = getLocaleWithoutRegionCode(locale);

  useEffect(() => {
    setMessages(undefined);

    let ignore = false;

    (async (): Promise<void> => {
      let loadedMessages: Record<string, string>;

      try {
        loadedMessages = await import(
          /* webpackChunkName: "locale-[request]" */
          `../../../../compiled-locales/${localeWithoutRegionCode}.json`
        );
      } catch (error) {
        if (
          !(
            error instanceof Error &&
            error.message.includes('Cannot find module')
          )
        )
          throw error;

        loadedMessages = await import(
          /* webpackChunkName: "locale-[request]" */
          `../../../../compiled-locales/${DEFAULT_LOCALE}.json`
        );
      }

      if (ignore) return;

      setMessages(loadedMessages);
    })();

    return () => {
      ignore = true;
    };
  }, [localeWithoutRegionCode]);

  if (!messages) return <LoadingIndicator />;

  return (
    <IntlProvider
      defaultLocale={DEFAULT_LOCALE}
      locale={locale}
      messages={messages}
      textComponent="span"
    >
      {props.children}
    </IntlProvider>
  );
};

export default I18nProvider;
