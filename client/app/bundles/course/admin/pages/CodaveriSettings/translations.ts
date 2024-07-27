import { defineMessages } from 'react-intl';

export default defineMessages({
  liveFeedbackEnabled: {
    id: 'course.admin.CodaveriSettings.liveFeedbackEnabled',
    defaultMessage: 'Enable live programming help generation',
  },
  liveFeedbackEnabledDescription: {
    id: 'course.admin.CodaveriSettings.liveFeedbackEnabledDescription',
    defaultMessage:
      'Individual assessments and programming questions may allow students to get live help.',
  },
  liveFeedbackDisabledDescription: {
    id: 'course.admin.CodaveriSettings.liveFeedbackDisabledDescription',
    defaultMessage:
      'Live help is disabled for all assessments and programming questions.',
  },
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
    defaultMessage: 'Automatic Post-Submission Comments',
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
  assessments: {
    id: 'course.admin.CodaveriSettings.assessments',
    defaultMessage: 'Assessments',
  },
  programmingQuestionSettings: {
    id: 'course.admin.CodaveriSettings.programmingQuestionSettings',
    defaultMessage: 'Programming Question Settings',
  },
  programmingQuestionSettingsSubtitle: {
    id: 'course.admin.CodaveriSettings.programmingQuestionSettingsSubtitle',
    defaultMessage:
      'Enable/disable Codaveri as evaluator for programming questions in various assessments.',
  },
  errorOccurredWhenUpdating: {
    id: 'course.admin.CodaveriSettings.errorOccurredWhenUpdating',
    defaultMessage: 'An error occurred while updating the codaveri setting.',
  },
  enableAllCodaveri: {
    id: 'course.admin.CodaveriSettings.enableAllCodaveri',
    defaultMessage: 'Enable All',
  },
  disableAllCodaveri: {
    id: 'course.admin.CodaveriSettings.disableAllCodaveri',
    defaultMessage: 'Disable All',
  },
  succesfulUpdateAllEvaluator: {
    id: 'course.admin.CodaveriSettings.succesfulUpdateAllEvaluator',
    defaultMessage:
      'Sucessfully updated all questions to use {evaluator} evaluator',
  },
  evaluatorUpdateSuccess: {
    id: 'course.admin.CodaveriSettings.evaluatorUpdateSuccess',
    defaultMessage: '{question} is now using {evaluator} evaluator',
  },
  expandAll: {
    id: 'course.admin.CodaveriSettings.expandAll',
    defaultMessage: 'Expand All Questions',
  },
  showCodaveriOnly: {
    id: 'course.admin.CodaveriSettings.showCodaveriOnly',
    defaultMessage: 'Codaveri Question Only',
  },
  None: {
    id: 'course.admin.CodaveriSettings.None',
    defaultMessage: 'None',
  },
  Some: {
    id: 'course.admin.CodaveriSettings.Some',
    defaultMessage: 'Some',
  },
  All: {
    id: 'course.admin.CodaveriSettings.All',
    defaultMessage: 'All',
  },
});
