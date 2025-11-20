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
  codaveriModel: {
    id: 'course.admin.CodaveriSettings.codaveriModel',
    defaultMessage: 'Model',
  },
  codaveriModelDescription: {
    id: 'course.admin.CodaveriSettings.codaveriModelDescription',
    defaultMessage:
      'The AI model used by Codaveri to generate help conversations with students for programming questions.',
  },
  codaveriSystemPrompt: {
    id: 'course.admin.CodaveriSettings.codaveriSystemPrompt',
    defaultMessage: 'System Prompt',
  },
  codaveriSystemPromptDescription: {
    id: 'course.admin.CodaveriSettings.codaveriSystemPromptDescription',
    defaultMessage:
      'The Codaveri system prompt controls AI behavior when interacting with students.',
  },
  codaveriUseDefaultSystemPrompt: {
    id: 'course.admin.CodaveriSettings.codaveriUseDefaultSystemPrompt',
    defaultMessage: 'Use the default system prompt',
  },
  codaveriOverrideSystemPrompt: {
    id: 'course.admin.CodaveriSettings.codaveriOverrideSystemPrompt',
    defaultMessage: 'Use a custom system prompt',
  },
  codaveriOverrideSystemPromptDescription: {
    id: 'course.admin.CodaveriSettings.codaveriOverrideSystemPromptDescription',
    defaultMessage:
      'When assisting students, these instructions will be followed in addition to any you have set on the question itself. To reference question-specific details, you may use these variables within the prompt, writing them with brackets as shown below:',
  },
  codaveriEmptySystemPrompt: {
    id: 'course.admin.CodaveriSettings.codaveriEmptySystemPrompt',
    defaultMessage:
      'You must enter a custom system prompt if you want to override the default one.',
  },
  codaveriSystemPromptProblemDescriptionLine: {
    id: 'course.admin.CodaveriSettings.codaveriSystemPromptProblemDescriptionLine',
    defaultMessage:
      '{problemDescriptionVar} : The full description of the coding problem.',
  },
  codaveriSystemPromptStudentFilePathsLine: {
    id: 'course.admin.CodaveriSettings.codaveriSystemPromptStudentFilePathsLine',
    defaultMessage:
      '{studentFilePathsVar} : A comma-separated list of file paths the student is working on.',
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
  errorOccurredWhenUpdatingCodaveriEvaluatorSettings: {
    id: 'course.admin.CodaveriSettings.errorOccurredWhenUpdatingCodaveriEvaluatorSettings',
    defaultMessage:
      'An error occurred while updating the codaveri evaluator settings.',
  },
  codaveriEvaluatorSettings: {
    id: 'course.admin.CodaveriSettings.codaveriEvaluatorSettings',
    defaultMessage: 'Codaveri Evaluator',
  },
  liveFeedbackSettings: {
    id: 'course.admin.CodaveriSettings.liveFeedbackSettings',
    defaultMessage: 'Get Help',
  },
  errorOccurredWhenUpdatingLiveFeedbackSettings: {
    id: 'course.admin.CodaveriSettings.errorOccurredWhenUpdatingLiveFeedbackSettings',
    defaultMessage: 'An error occurred while updating the Get Help settings.',
  },
  enableDisableButton: {
    id: 'course.admin.CodaveriSettings.enableDisableButton',
    defaultMessage: '{enabled, select, true {Enable} other {Disable}}',
  },
  enableDisableEvaluator: {
    id: 'course.admin.CodaveriSettings.enableDisableEvaluator',
    defaultMessage:
      '{enabled, select, true {Enable } other {Disable }} Codaveri Evaluator for {questionCount} \
      programming questions in {title}?',
  },
  enableDisableLiveFeedback: {
    id: 'course.admin.CodaveriSettings.enableDisableLiveFeedback',
    defaultMessage:
      '{enabled, select, true {Enable } other {Disable }} Get Help for {questionCount} \
      programming questions in {title}?',
  },
  enableDisableEvaluatorDescription: {
    id: 'course.admin.CodaveriSettings.enableDisableEvaluatorDescription',
    defaultMessage:
      '{questionCount} programming questions in this {type} will use {enabled, select, true {Codaveri } other {Default }} evaluator',
  },
  succesfulUpdateAllEvaluator: {
    id: 'course.admin.CodaveriSettings.succesfulUpdateAllEvaluator',
    defaultMessage:
      'Successfully updated all questions to use {evaluator} evaluator',
  },
  successfulUpdateAllLiveFeedbackEnabled: {
    id: 'course.admin.CodaveriSettings.successfulUpdateAllLiveFeedbackEnabled',
    defaultMessage:
      'Successfully {liveFeedbackEnabled, select, true {enabled} other {disabled}} Get Help for all questions',
  },
  evaluatorUpdateSuccess: {
    id: 'course.admin.CodaveriSettings.evaluatorUpdateSuccess',
    defaultMessage: '{question} is now using {evaluator} evaluator',
  },
  liveFeedbackEnabledUpdateSuccess: {
    id: 'course.admin.CodaveriSettings.liveFeedbackEnabledUpdateSuccess',
    defaultMessage:
      'Get Help for {question} is now {liveFeedbackEnabled, select, true {enabled} other {disabled}}',
  },
  expandAll: {
    id: 'course.admin.CodaveriSettings.expandAll',
    defaultMessage: 'Expand All Questions',
  },
  Some: {
    id: 'course.admin.CodaveriSettings.Some',
    defaultMessage: 'Some',
  },
  getHelpUsageLimit: {
    id: 'course.admin.CodaveriSettings.getHelpUsageLimit',
    defaultMessage: 'Limit Get Help messages per student',
  },
  getHelpUsageLimitDescription: {
    id: 'course.admin.CodaveriSettings.getHelpUsageLimitDescription',
    defaultMessage:
      'If enabled, students will only be able to send a limited number of messages per question. Students will be able to see this limit and how many messages they have left.',
  },
  maxGetHelpUserMessages: {
    id: 'course.admin.CodaveriSettings.maxGetHelpUserMessages',
    defaultMessage: 'Maximum messages per question',
  },
});
