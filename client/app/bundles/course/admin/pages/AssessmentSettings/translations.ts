import { defineMessages } from 'react-intl';

export default defineMessages({
  assessmentSettings: {
    id: 'course.admin.assessment.assessmentSettings',
    defaultMessage: 'Assessment settings',
  },
  containsNAssessments: {
    id: 'course.admin.assessment.containsNAssessments',
    defaultMessage: 'has {n, plural, one {# item} other {# items}}',
  },
  categoriesAndTabs: {
    id: 'course.admin.assessment.categoriesAndTabs',
    defaultMessage: 'Categories and tabs',
  },
  categoriesAndTabsSubtitle: {
    id: 'course.admin.assessment.categoriesAndTabsSubtitle',
    defaultMessage:
      'Drag and drop the categories and tabs to rearrange or group them.',
  },
  addACategory: {
    id: 'course.admin.assessment.addACategory',
    defaultMessage: 'Add a category',
  },
  newCategoryDefaultName: {
    id: 'course.admin.assessment.newCategoryDefaultName',
    defaultMessage: 'New Category',
  },
  newTabDefaultName: {
    id: 'course.admin.assessment.newTabDefaultName',
    defaultMessage: 'New Tab',
  },
  addATab: {
    id: 'course.admin.assessment.addATab',
    defaultMessage: 'Tab',
  },
  allowStudentsToView: {
    id: 'course.admin.assessment.allowStudentsToView',
    defaultMessage: 'Allow students to view',
  },
  outputsOfPublicTestCases: {
    id: 'course.admin.assessment.outputsOfPublicTestCases',
    defaultMessage: 'Outputs of Public test cases',
  },
  standardOutputsAndStandardErrors: {
    id: 'course.admin.assessment.standardOutputsAndStandardErrors',
    defaultMessage: 'Standard outputs and Standard errors',
  },
  randomisation: {
    id: 'course.admin.assessment.randomisation',
    defaultMessage: 'Randomisation options',
  },
  enableRandomisedAssessments: {
    id: 'course.admin.assessment.enableRandomisedAssessments',
    defaultMessage: 'Enable randomised assessments',
  },
  enableMcqChoicesRandomisations: {
    id: 'course.admin.assessment.enableMcqChoicesRandomisations',
    defaultMessage: 'Enable MCQ choices randomisations',
  },
  deleteCategoryPromptAction: {
    id: 'course.admin.assessment.deleteCategoryPromptAction',
    defaultMessage: 'Delete {title} category',
  },
  deleteCategoryPromptTitle: {
    id: 'course.admin.assessment.deleteCategoryPromptTitle',
    defaultMessage: 'Delete {title} category?',
  },
  deleteCategoryPromptMessage: {
    id: 'course.admin.assessment.deleteCategoryPromptMessage',
    defaultMessage:
      'Deleting this category will delete all its associated assessments and submissions. This action is irreversible.',
  },
  deleteTabPromptAction: {
    id: 'course.admin.assessment.deleteTabPromptAction',
    defaultMessage: 'Delete {title} tab',
  },
  deleteTabPromptTitle: {
    id: 'course.admin.assessment.deleteTabPromptTitle',
    defaultMessage: 'Delete {title} tab?',
  },
  deleteTabPromptMessage: {
    id: 'course.admin.assessment.deleteTabPromptMessage',
    defaultMessage:
      'Deleting this tab will delete all its associated assessments and submissions. This action is irreversible.',
  },
  moveAssessmentsToTabThenDelete: {
    id: 'course.admin.assessment.moveAssessmentsToTabThenDelete',
    defaultMessage: 'Move assessments to {tab} then delete',
  },
  moveAssessmentsThenDelete: {
    id: 'course.admin.assessment.moveAssessmentsThenDelete',
    defaultMessage: 'Move assessments then delete',
  },
  toTab: {
    id: 'course.admin.assessment.toTab',
    defaultMessage: 'to {tab}',
  },
  thisCategoryContains: {
    id: 'course.admin.assessment.thisCategoryContains',
    defaultMessage: 'This category contains:',
  },
  thisTabContains: {
    id: 'course.admin.assessment.thisTabContains',
    defaultMessage: 'This tab contains:',
  },
  andNMoreItems: {
    id: 'course.admin.assessment.andNMoreItems',
    defaultMessage: 'and {n, plural, one {# more item} other {# more items}}',
  },
  movingAssessmentsTo: {
    id: 'course.admin.assessment.movingAssessmentsTo',
    defaultMessage: 'Moving assessments to {tab}...',
  },
  nAssessmentsMoved: {
    id: 'course.admin.assessment.nAssessmentsMoved',
    defaultMessage: '{n} were successfully moved to {tab}.',
  },
  errorWhenMovingAssessments: {
    id: 'course.admin.assessment.errorWhenMovingAssessments',
    defaultMessage: 'An error occurred when moving assessments to {tab}.',
  },
});
