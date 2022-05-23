import { defineMessages } from 'react-intl';
import mirrorCreator from 'mirror-creator';

const responseStatus = mirrorCreator([
  'NOT_STARTED',
  'SUBMITTED',
  'RESPONDING',
]);

const translations = defineMessages({
  name: {
    id: 'course.surveys.ResponseIndex.name',
    defaultMessage: 'Name',
  },
  responseStatus: {
    id: 'course.surveys.ResponseIndex.responseStatus',
    defaultMessage: 'Response Status',
  },
  [responseStatus.NOT_STARTED]: {
    id: 'course.surveys.ResponseIndex.notStarted',
    defaultMessage: 'Not Started',
  },
  [responseStatus.SUBMITTED]: {
    id: 'course.surveys.ResponseIndex.submitted',
    defaultMessage: 'Submitted',
  },
  [responseStatus.RESPONDING]: {
    id: 'course.surveys.ResponseIndex.responding',
    defaultMessage: 'Responding',
  },
  submittedAt: {
    id: 'course.surveys.ResponseIndex.submittedAt',
    defaultMessage: 'Submitted At',
  },
  updatedAt: {
    id: 'course.surveys.ResponseIndex.updatedAt',
    defaultMessage: 'Last Updated At',
  },
  phantoms: {
    id: 'course.surveys.ResponseIndex.phantoms',
    defaultMessage: 'Phantom Students',
  },
  stats: {
    id: 'course.surveys.ResponseIndex.stats',
    defaultMessage: 'Response Statistics',
  },
  includePhantoms: {
    id: 'course.surveys.ResponseIndex.includePhantoms',
    defaultMessage: 'Include Phantom Students',
  },
  unsubmit: {
    id: 'course.surveys.UnsubmitButton.unsubmit',
    defaultMessage: 'Unsubmit',
  },
  unsubmitSuccess: {
    id: 'course.surveys.UnsubmitButton.unsubmitSuccess',
    defaultMessage: 'The response has been unsubmitted.',
  },
  unsubmitFailure: {
    id: 'course.surveys.UnsubmitButton.unsubmitFailure',
    defaultMessage: 'Unsubmit Failed.',
  },
  confirm: {
    id: 'course.surveys.UnsubmitButton.confirm',
    defaultMessage:
      'Once unsubmitted, you will not be able to submit on behalf of a student. \
      Are you sure that you want to unsubmit?',
  },
});

export default translations;
