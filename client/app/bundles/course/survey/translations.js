import { defineMessages } from 'react-intl';

const translations = defineMessages({
  surveys: {
    id: 'course.surveys',
    defaultMessage: 'Surveys',
  },
  title: {
    id: 'course.surveys.fields.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.surveys.fields.description',
    defaultMessage: 'Description',
  },
  opensAt: {
    id: 'course.surveys.fields.openAt',
    defaultMessage: 'Opens At',
  },
  expiresAt: {
    id: 'course.surveys.fields.expiresAt',
    defaultMessage: 'Expires At',
  },
  anonymous: {
    id: 'course.surveys.fields.anonymous',
    defaultMessage: 'Anonymous',
  },
  allowResponseAfterEnd: {
    id: 'course.surveys.fields.allowResponseAfterEnd',
    defaultMessage: 'Allow Responses After Survey Expires',
  },
  allowModifyAfterSubmit: {
    id: 'course.surveys.fields.allowModifyAfterSubmit',
    defaultMessage: 'Allow Submitted Responses To Be Modified',
  },
  basePoints: {
    id: 'course.surveys.fields.basePoints',
    defaultMessage: 'Base Points',
  },
  bonusPoints: {
    id: 'course.surveys.fields.bonusPoints',
    defaultMessage: 'Bonus Points',
  },
  published: {
    id: 'course.surveys.fields.published',
    defaultMessage: 'Published',
  },
  questionText: {
    id: 'course.surveys.questionText',
    defaultMessage: 'Question Text',
  },
  questions: {
    id: 'course.surveys.questions',
    defaultMessage: 'Questions',
  },
  questionType: {
    id: 'course.surveys.questions.fields.questionType',
    defaultMessage: 'Question Type',
  },
  textResponse: {
    id: 'course.surveys.questions.fields.questionTypes.textResponse',
    defaultMessage: 'Text Response Question',
  },
  multipleChoice: {
    id: 'course.surveys.questions.fields.questionTypes.multipleChoice',
    defaultMessage: 'Mulitple Choice Question',
  },
  multipleResponse: {
    id: 'course.surveys.questions.fields.questionTypes.multipleResponse',
    defaultMessage: 'Mulitple Response Question',
  },
  maxOptions: {
    id: 'course.surveys.questions.fields.maxOptions',
    defaultMessage: 'Maximum Allowed Responses',
  },
  minOptions: {
    id: 'course.surveys.questions.fields.minOptions',
    defaultMessage: 'Minimum Allowed Responses',
  },
  updateSuccess: {
    id: 'course.surveys.updateSuccess',
    defaultMessage: 'Survey "{title}" updated.',
  },
  updateFailure: {
    id: 'course.surveys.updateFailure',
    defaultMessage: 'Failed to update survey.',
  },
  deleteSuccess: {
    id: 'course.surveys.deleteSuccess',
    defaultMessage: 'Survey "{title}" deleted.',
  },
  deleteFailure: {
    id: 'course.surveys.deleteFailure',
    defaultMessage: 'Failed to delete survey.',
  },
  results: {
    id: 'course.surveys.results',
    defaultMessage: 'Results',
  },
  responses: {
    id: 'course.surveys.responses',
    defaultMessage: 'Responses',
  },
});

export default translations;
