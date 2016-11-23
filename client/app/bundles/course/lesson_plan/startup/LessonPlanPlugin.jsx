import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';

import zh from 'react-intl/locale-data/zh';

import createStore from '../store';
import LessonPlanContainer from '../containers/LessonPlanContainer';
import translations from '../../../../../build/locales/locales.json';


export default (props, locale) => {
  const i18nLocale = locale;
  const availableForeignLocales = { zh };
  const localeWithoutRegionCode = i18nLocale.toLowerCase().split(/[_-]+/)[0];

  let messages;
  if (localeWithoutRegionCode !== 'en' && availableForeignLocales[localeWithoutRegionCode]) {
    addLocaleData(availableForeignLocales[localeWithoutRegionCode]);
    messages = translations[localeWithoutRegionCode] || translations[i18nLocale];
  }

  const store = createStore(props);

  const reactComponent = (
    <Provider store={store}>
      <IntlProvider locale={i18nLocale} messages={messages}>
        <LessonPlanContainer />
      </IntlProvider>
    </Provider>
  );

  return reactComponent;
};
