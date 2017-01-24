import { defineMessages } from 'react-intl';

const translations = defineMessages({
  cancel: {
    id: 'lib.form.buttons.cancel',
    defaultMessage: 'Cancel',
  },
  submit: {
    id: 'lib.form.buttons.submit',
    defaultMessage: 'Submit',
  },
  discard: {
    id: 'lib.form.buttons.discard',
    defaultMessage: 'Discard',
  },
  discardChanges: {
    id: 'lib.form.messages.discardChanges',
    defaultMessage: 'Discard Changes?',
  },
  numeric: {
    id: 'lib.form.validation.numeric',
    defaultMessage: 'Enter a number',
  },
  required: {
    id: 'lib.form.validation.required',
    defaultMessage: 'Required',
  },
  invalid: {
    id: 'lib.form.validation.invalid',
    defaultMessage: 'Invalid',
  },
});

export default translations;
