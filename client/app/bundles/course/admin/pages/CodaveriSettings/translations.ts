import { defineMessages } from 'react-intl';

export default defineMessages({
  codaveriSettings: {
    id: 'course.admin.CodaveriSettings.codaveriSettings',
    defaultMessage: 'Codaveri settings',
  },
  codaveriSettingsSubtitle: {
    id: 'course.admin.CodaveriSettings.codaveriSettingsSubtitle',
    defaultMessage:
      "This is currently an experimental feature. \
      Codaveri provides code evaluation and automated code feedback services for students' codes.",
  },
  feedbackWorkflow: {
    id: 'course.admin.CodaveriSettings.feedbackWorkflow',
    defaultMessage: 'Automatic Feedback Comment',
  },
  feedbackWorkflowDescription: {
    id: 'course.admin.CodaveriSettings.feedbackWorkflowDescription',
    defaultMessage: 'When a submission with programming question is finalised,',
  },
  feedbackWorkflowNone: {
    id: 'course.admin.CodaveriSettings.feedbackWorkflowNone',
    defaultMessage: 'Generate no feedback',
  },
  feedbackWorkflowDraft: {
    id: 'course.admin.CodaveriSettings.feedbackWorkflowDraft',
    defaultMessage:
      'Generate feedback as a draft requiring approval from staff',
  },
  feedbackWorkflowPublish: {
    id: 'course.admin.CodaveriSettings.feedbackWorkflowPublish',
    defaultMessage: 'Publish feedback directly to student',
  },
  codaveriEngine: {
    id: 'course.admin.CodaveriSettings.codaveriEngine',
    defaultMessage: 'Codaveri Engine',
  },
  codaveriEngineDescription: {
    id: 'course.admin.CodaveriSettings.codaveriEngineDescription',
    defaultMessage:
      'Type of codaveri engine used to generate programming code feedback',
  },
  defaultEngine: {
    id: 'course.admin.CodaveriSettings.defaultEngine',
    defaultMessage: 'Default Engine',
  },
  defaultEngineDescription: {
    id: 'course.admin.CodaveriSettings.defaultEngineDescription',
    defaultMessage: 'Uses generative AI and verification techniques',
  },
  itspEngine: {
    id: 'course.admin.CodaveriSettings.itspEngine',
    defaultMessage: 'ITSP Engine',
  },
  itspEngineDescription: {
    id: 'course.admin.CodaveriSettings.itspEngineDescription',
    defaultMessage: 'Uses automated program repair technique',
  },
});
