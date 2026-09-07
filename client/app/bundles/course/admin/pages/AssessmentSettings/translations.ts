import { defineMessages } from 'react-intl';

export default defineMessages({
  assessmentSettings: {
    id: 'course.admin.AssessmentSettings.assessmentSettings',
    defaultMessage: 'Assessment settings',
  },
  containsNAssessments: {
    id: 'course.admin.AssessmentSettings.containsNAssessments',
    defaultMessage: 'has {n, plural, one {# item} other {# items}}',
  },
  categoriesAndTabs: {
    id: 'course.admin.AssessmentSettings.categoriesAndTabs',
    defaultMessage: 'Categories and tabs',
  },
  categoriesAndTabsSubtitle: {
    id: 'course.admin.AssessmentSettings.categoriesAndTabsSubtitle',
    defaultMessage:
      'Drag and drop the categories and tabs to rearrange or group them.',
  },
  addACategory: {
    id: 'course.admin.AssessmentSettings.addACategory',
    defaultMessage: 'Add a category',
  },
  newCategoryDefaultName: {
    id: 'course.admin.AssessmentSettings.newCategoryDefaultName',
    defaultMessage: 'New Category',
  },
  newTabDefaultName: {
    id: 'course.admin.AssessmentSettings.newTabDefaultName',
    defaultMessage: 'New Tab',
  },
  addATab: {
    id: 'course.admin.AssessmentSettings.addATab',
    defaultMessage: 'Tab',
  },
  allowStudentsToView: {
    id: 'course.admin.AssessmentSettings.allowStudentsToView',
    defaultMessage: 'Allow students to view',
  },
  outputsOfPublicTestCases: {
    id: 'course.admin.AssessmentSettings.outputsOfPublicTestCases',
    defaultMessage: 'Outputs of Public test cases',
  },
  maxProgrammingTimeLimit: {
    id: 'course.admin.AssessmentSettings.maxProgrammingTimeLimit',
    defaultMessage: 'Maximum evaluation time limit',
  },
  standardOutputsAndStandardErrors: {
    id: 'course.admin.AssessmentSettings.standardOutputsAndStandardErrors',
    defaultMessage: 'Standard outputs and Standard errors',
  },
  enableRandomisedAssessments: {
    id: 'course.admin.AssessmentSettings.enableRandomisedAssessments',
    defaultMessage: 'Enable randomised assessments',
  },
  enableMcqChoicesRandomisations: {
    id: 'course.admin.AssessmentSettings.enableMcqChoicesRandomisations',
    defaultMessage: 'Randomise MCQ choices',
  },
  rubricGrading: {
    id: 'course.admin.AssessmentSettings.rubricGrading',
    defaultMessage: 'AI Rubric Grading',
  },
  useRubricGradingPrompt: {
    id: 'course.admin.AssessmentSettings.useRubricGradingPrompt',
    defaultMessage: 'Use course-wide grading prompt',
  },
  rubricGradingPromptHint: {
    id: 'course.admin.AssessmentSettings.rubricGradingPromptHint',
    defaultMessage:
      "When a question with a grading rubric is autograded with AI, these instructions will be inserted before the question's specific grading prompt.",
  },
  gradingModel: {
    id: 'course.admin.AssessmentSettings.gradingModel',
    defaultMessage: 'Grading model',
  },
  useModelOptions: {
    id: 'course.admin.AssessmentSettings.useModelOptions',
    defaultMessage: 'Override model options',
  },
  modelOptionsHint: {
    id: 'course.admin.AssessmentSettings.modelOptionsHint',
    defaultMessage:
      "Replaces the selected model's own options entirely, so specify every required option, for example {example}.",
  },
  modelOptionsMustBeJsonObject: {
    id: 'course.admin.AssessmentSettings.modelOptionsMustBeJsonObject',
    defaultMessage: 'Model options must be a valid JSON object.',
  },
  modelOptionsRequired: {
    id: 'course.admin.AssessmentSettings.modelOptionsRequired',
    defaultMessage: 'Please enter the model options, or disable the override.',
  },
  useSystemPrompt: {
    id: 'course.admin.AssessmentSettings.useSystemPrompt',
    defaultMessage: 'Override system prompt',
  },
  systemPromptOverrideHint: {
    id: 'course.admin.AssessmentSettings.systemPromptOverrideHint',
    defaultMessage:
      'Replaces the built-in rubric grading system prompt entirely (shown below for reference). This is NOT the course-wide grading prompt below, but the top-level instructions that frame it and all other inputs to the rubric grading model.',
  },
  systemPromptVariablesHint: {
    id: 'course.admin.AssessmentSettings.systemPromptVariablesHint',
    defaultMessage:
      'An override is filled in exactly like the built-in prompt: {variables} are substituted before the request is sent, and they are the only way these inputs reach the model — the answer being graded is sent separately.',
  },
  systemPromptRequired: {
    id: 'course.admin.AssessmentSettings.systemPromptRequired',
    defaultMessage: 'Please enter a system prompt, or disable the override.',
  },
  rubricGradingPromptRequired: {
    id: 'course.admin.AssessmentSettings.rubricGradingPromptRequired',
    defaultMessage:
      'Please enter a grading prompt, or disable the course-wide grading prompt.',
  },
  deleteCategoryPromptAction: {
    id: 'course.admin.AssessmentSettings.deleteCategoryPromptAction',
    defaultMessage: 'Delete {title} category',
  },
  deleteCategoryPromptTitle: {
    id: 'course.admin.AssessmentSettings.deleteCategoryPromptTitle',
    defaultMessage: 'Delete {title} category?',
  },
  deleteCategoryPromptMessage: {
    id: 'course.admin.AssessmentSettings.deleteCategoryPromptMessage',
    defaultMessage:
      'Deleting this category will delete all its associated assessments and submissions. This action is irreversible.',
  },
  deleteTabPromptAction: {
    id: 'course.admin.AssessmentSettings.deleteTabPromptAction',
    defaultMessage: 'Delete {title} tab',
  },
  deleteTabPromptTitle: {
    id: 'course.admin.AssessmentSettings.deleteTabPromptTitle',
    defaultMessage: 'Delete {title} tab?',
  },
  deleteTabPromptMessage: {
    id: 'course.admin.AssessmentSettings.deleteTabPromptMessage',
    defaultMessage:
      'Deleting this tab will delete all its associated assessments and submissions. This action is irreversible.',
  },
  moveAssessmentsToTabThenDelete: {
    id: 'course.admin.AssessmentSettings.moveAssessmentsToTabThenDelete',
    defaultMessage: 'Move assessments to {tab} then delete',
  },
  moveAssessmentsThenDelete: {
    id: 'course.admin.AssessmentSettings.moveAssessmentsThenDelete',
    defaultMessage: 'Move assessments then delete',
  },
  moveTabsToCategoryThenDelete: {
    id: 'course.admin.AssessmentSettings.moveTabsToCategoryThenDelete',
    defaultMessage: 'Move tabs to {category} then delete',
  },
  moveTabsThenDelete: {
    id: 'course.admin.AssessmentSettings.moveTabsThenDelete',
    defaultMessage: 'Move tabs then delete',
  },
  maxTimeLimitRequired: {
    id: 'course.admin.AssessmentSettings.maxTimeLimitRequired',
    defaultMessage: 'Maximum programming time limit is required',
  },
  positiveMaxTimeLimitRequired: {
    id: 'course.admin.AssessmentSettings.positiveMaxTimeLimitRequired',
    defaultMessage: 'Maximum programming time limit must be a positive integer',
  },
  toTab: {
    id: 'course.admin.AssessmentSettings.toTab',
    defaultMessage: 'to {tab}',
  },
  thisCategoryContains: {
    id: 'course.admin.AssessmentSettings.thisCategoryContains',
    defaultMessage: 'This category contains:',
  },
  thisTabContains: {
    id: 'course.admin.AssessmentSettings.thisTabContains',
    defaultMessage: 'This tab contains:',
  },
  andNMoreItems: {
    id: 'course.admin.AssessmentSettings.andNMoreItems',
    defaultMessage: 'and {n, plural, one {# more item} other {# more items}}.',
  },
  nAssessmentsMoved: {
    id: 'course.admin.AssessmentSettings.nAssessmentsMoved',
    defaultMessage: '{n} assessments were successfully moved to {tab}.',
  },
  nTabsMoved: {
    id: 'course.admin.AssessmentSettings.nTabsMoved',
    defaultMessage: '{n} tabs were successfully moved to {category}.',
  },
  errorOccurredWhenMovingAssessments: {
    id: 'course.admin.AssessmentSettings.errorOccurredWhenMovingAssessments',
    defaultMessage: 'An error occurred while moving the assessments.',
  },
  errorOccurredWhenMovingTabs: {
    id: 'course.admin.AssessmentSettings.errorOccurredWhenMovingTabs',
    defaultMessage: 'An error occurred while moving the tabs.',
  },
  errorOccurredWhenCreatingCategory: {
    id: 'course.admin.AssessmentSettings.errorOccurredWhenCreatingCategory',
    defaultMessage: 'An error occurred while creating a category.',
  },
  errorOccurredWhenCreatingTab: {
    id: 'course.admin.AssessmentSettings.errorOccurredWhenCreatingTab',
    defaultMessage: 'An error occurred while creating a tab.',
  },
  errorOccurredWhenDeletingCategory: {
    id: 'course.admin.AssessmentSettings.errorOccurredWhenDeletingCategory',
    defaultMessage: 'An error occurred while deleting the category.',
  },
  errorOccurredWhenDeletingTab: {
    id: 'course.admin.AssessmentSettings.errorOccurredWhenDeletingTab',
    defaultMessage: 'An error occurred while deleting the tab.',
  },
  seconds: {
    id: 'course.admin.AssessmentSettings.seconds',
    defaultMessage: 's',
  },
  programmingQuestionSettings: {
    id: 'course.admin.AssessmentSettings.programmingQuestionSettings',
    defaultMessage: 'Programming Question settings',
  },
  maxProgrammingTimeLimitHint: {
    id: 'course.admin.AssessmentSettings.maxProgrammingTimeLimitHint',
    defaultMessage:
      'This will be the upper bound for the time limits of all programming questions in this course. ' +
      'If there are programming questions with time limits greater than this, this time limit will take precedence.',
  },
});
