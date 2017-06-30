import { defineMessages } from 'react-intl';

const translations = defineMessages({
  submitConfirmation: {
    id: 'course.assessment.submission.submitConfirmation',
    defaultMessage: 'THIS ACTION IS IRREVERSIBLE Are you sure you want to submit? You will no longer be able to amend your submission!',
  },
  unsubmitConfirmation: {
    id: 'course.assessment.submission.unsubmitConfirmation',
    defaultMessage: 'This will reset the submission time and permit the student to change his submission. NOTE THAT YOU CANNOT UNDO THIS!! Are you sure you want to proceed?',
  },
});

export default translations;
