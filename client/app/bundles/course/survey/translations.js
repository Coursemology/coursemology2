import { defineMessages } from 'react-intl';

const translations = defineMessages({
  surveys: {
    id: 'course.survey.surveys',
    defaultMessage: 'Surveys',
  },
  title: {
    id: 'course.survey.fields.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.survey.fields.description',
    defaultMessage: 'Description',
  },
  opensAt: {
    id: 'course.survey.fields.openAt',
    defaultMessage: 'Opens at',
  },
  expiresAt: {
    id: 'course.survey.fields.expiresAt',
    defaultMessage: 'Closes at',
  },
  bonusEndsAt: {
    id: 'course.survey.fields.bonusEndsAt',
    defaultMessage: 'Bonus ends at',
  },
  closingRemindedAt: {
    id: 'course.survey.fields.closingRemindedAt',
    defaultMessage: 'Last Reminder Sent At',
  },
  anonymous: {
    id: 'course.survey.fields.anonymous',
    defaultMessage: 'Anonymous responses',
  },
  allowResponseAfterEnd: {
    id: 'course.survey.fields.allowResponseAfterEnd',
    defaultMessage: 'Allow responses after survey closes',
  },
  allowModifyAfterSubmit: {
    id: 'course.survey.fields.allowModifyAfterSubmit',
    defaultMessage: 'Allow response editing',
  },
  basePoints: {
    id: 'course.survey.fields.basePoints',
    defaultMessage: 'Base EXP',
  },
  bonusPoints: {
    id: 'course.survey.fields.bonusPoints',
    defaultMessage: 'Time Bonus EXP',
  },
  published: {
    id: 'course.survey.fields.published',
    defaultMessage: 'Published',
  },
  questionText: {
    id: 'course.survey.questionText',
    defaultMessage: 'Question Text',
  },
  questions: {
    id: 'course.survey.questions',
    defaultMessage: 'Questions',
  },
  questionType: {
    id: 'course.survey.questions.fields.questionType',
    defaultMessage: 'Question Type',
  },
  textResponse: {
    id: 'course.survey.questions.fields.questionTypes.textResponse',
    defaultMessage: 'Text Response Question',
  },
  multipleChoice: {
    id: 'course.survey.questions.fields.questionTypes.multipleChoice',
    defaultMessage: 'Multiple Choice Question',
  },
  multipleResponse: {
    id: 'course.survey.questions.fields.questionTypes.multipleResponse',
    defaultMessage: 'Multiple Response Question',
  },
  maxOptions: {
    id: 'course.survey.questions.fields.maxOptions',
    defaultMessage: 'Maximum Allowed Responses',
  },
  minOptions: {
    id: 'course.survey.questions.fields.minOptions',
    defaultMessage: 'Minimum Allowed Responses',
  },
  updateSuccess: {
    id: 'course.survey.updateSuccess',
    defaultMessage: 'Survey "{title}" updated.',
  },
  updateFailure: {
    id: 'course.survey.updateFailure',
    defaultMessage: 'Failed to update survey.',
  },
  requestFailure: {
    id: 'course.survey.requestFailure',
    defaultMessage: 'An error occurred while processing your request.',
  },
  deleteSuccess: {
    id: 'course.survey.deleteSuccess',
    defaultMessage: 'Survey "{title}" deleted.',
  },
  deleteFailure: {
    id: 'course.survey.deleteFailure',
    defaultMessage: 'Failed to delete survey.',
  },
  results: {
    id: 'course.survey.results',
    defaultMessage: 'Results',
  },
  responses: {
    id: 'course.survey.responses',
    defaultMessage: 'Responses',
  },
  startEndValidationError: {
    id: 'course.survey.SurveyForm.startEndValidationError',
    defaultMessage: 'Must be after opening time.',
  },
  bonusEndValidationError: {
    id: 'course.survey.SurveyForm.bonusEndValidationError',
    defaultMessage: 'Must be between opening and closing time.',
  },
  allowModifyAfterSubmitHint: {
    id: 'course.survey.SurveyForm.allowModifyAfterSubmitHint',
    defaultMessage: 'Responses can be changed after being submitted.',
  },
  anonymousHint: {
    id: 'course.survey.SurveyForm.anonymousHint',
    defaultMessage:
      'If enabled, staff can see the survey results but not individual responses. \
      Cannot be changed once there are submissions.',
  },
  hasStudentResponse: {
    id: 'course.survey.SurveyForm.hasStudentResponse',
    defaultMessage:
      'At least one student has responded to this survey. You may not remove anonymity.',
  },
});

export default translations;
