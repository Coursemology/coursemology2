import { defineMessages } from 'react-intl';
import mirrorCreator from 'mirror-creator';

const responseStatus = mirrorCreator([
  'NOT_STARTED',
  'SUBMITTED',
  'RESPONDING',
]);

const translations = defineMessages({
  name: {
    id: 'course.survey.ResponseIndex.name',
    defaultMessage: 'Name',
  },
  responseStatus: {
    id: 'course.survey.ResponseIndex.responseStatus',
    defaultMessage: 'Response Status',
  },
  [responseStatus.NOT_STARTED]: {
    id: 'course.survey.ResponseIndex.notStarted',
    defaultMessage: 'Not Started',
  },
  [responseStatus.SUBMITTED]: {
    id: 'course.survey.ResponseIndex.submitted',
    defaultMessage: 'Submitted',
  },
  [responseStatus.RESPONDING]: {
    id: 'course.survey.ResponseIndex.responding',
    defaultMessage: 'Responding',
  },
  submittedAt: {
    id: 'course.survey.ResponseIndex.submittedAt',
    defaultMessage: 'Submitted At',
  },
  updatedAt: {
    id: 'course.survey.ResponseIndex.updatedAt',
    defaultMessage: 'Last Updated At',
  },
  phantoms: {
    id: 'course.survey.ResponseIndex.phantoms',
    defaultMessage: 'Phantom Students',
  },
  stats: {
    id: 'course.survey.ResponseIndex.stats',
    defaultMessage: 'Response Statistics',
  },
  includePhantoms: {
    id: 'course.survey.ResponseIndex.includePhantoms',
    defaultMessage: 'Include Phantom Students',
  },
  unsubmit: {
    id: 'course.survey.ResponseIndex.unsubmit',
    defaultMessage: 'Unsubmit Survey',
  },
  responses: {
    id: 'course.survey.ResponseIndex.responses',
    defaultMessage: 'Responses',
  },
});

export default translations;
