import { defineMessages } from 'react-intl';

const messagesTranslations = defineMessages({
  fetchingError: {
    id: 'lib.translations.messages.fetchingError',
    defaultMessage:
      'An error occurred when loading your data. Please reload and try again.',
  },
  passwordIsVisible: {
    id: 'lib.translations.messages.passwordIsVisible',
    defaultMessage:
      'Your password is visible! Watch out for eyes behind you...',
  },
});

export default messagesTranslations;
