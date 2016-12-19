import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';

import zh from 'react-intl/locale-data/zh';

import createStore from './programming/store';
import ProgrammingQuestion from './programming/containers/ProgrammingQuestion';
import translations from '../../../../../build/locales/locales.json';

const renderProgrammingQuestion = (props) => {
  const i18nLocale = $("meta[name='server-context']").data('i18n-locale');
  const availableForeignLocales = { zh };
  const localeWithoutRegionCode = i18nLocale.toLowerCase().split(/[_-]+/)[0];

  let messages;
  if (localeWithoutRegionCode !== 'en' && availableForeignLocales[localeWithoutRegionCode]) {
    addLocaleData(availableForeignLocales[localeWithoutRegionCode]);
    messages = translations[localeWithoutRegionCode] || translations[i18nLocale];
  }

  const store = createStore(props);

  render(
    <Provider store={store}>
      <IntlProvider locale={i18nLocale} messages={messages}>
        <ProgrammingQuestion />
      </IntlProvider>
    </Provider>
    , $('#programming-question')[0]
  );
};

$.getJSON('', (data) => {
  $(document).ready(() => {
    renderProgrammingQuestion(data);
  });
});
