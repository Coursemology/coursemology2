import { defineMessages } from 'react-intl';

const messagesTranslations = defineMessages({
  fetchingError: {
    id: 'lib.translations.messages.fetchingError',
    defaultMessage:
      'An error occurred when loading your data. Please reload and try again.',
  },
  loadImageError: {
    id: 'lib.translations.messages.loadImageError',
    defaultMessage:
      'An error occurred when loading your image. Please try selecting another one.',
  },
  formUpdateError: {
    id: 'lib.translations.messages.formUpdateError',
    defaultMessage:
      'An error occurred when saving your changes. You may reload and try again.',
  },
  featureUnavailable: {
    id: 'lib.translations.messages.featureUnavailable',
    defaultMessage: 'This feature is currently unavailable.',
  },
});

export default messagesTranslations;
