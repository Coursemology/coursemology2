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
  resetConfirmation: {
    id: 'course.assessment.submission.resetConfirmation',
    defaultMessage: 'Are you sure you want to reset your answer? This action is irreversible and you will lose all your current work for this question.',
  },
  missingAnswer: {
    id: 'course.assessment.submission.missingAnswer',
    defaultMessage: 'There is no answer submitted for this question - this might be caused by the addition of this question after the submission is submitted.',
  },
});

export default translations;
