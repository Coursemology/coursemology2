import { defineMessages } from 'react-intl';

const translations = defineMessages({
  // Page title
  rubricPlayground: {
    id: 'course.assessment.question.rubricPlayground.rubricPlayground',
    defaultMessage: 'Rubric Playground',
  },

  // RubricHeader
  savedRubric: {
    id: 'course.assessment.question.rubricPlayground.savedRubric',
    defaultMessage: 'Saved Rubric, {date}',
  },
  activeRubric: {
    id: 'course.assessment.question.rubricPlayground.activeRubric',
    defaultMessage: 'Active',
  },
  latestRubric: {
    id: 'course.assessment.question.rubricPlayground.latestRubric',
    defaultMessage: 'Latest',
  },
  unsavedRubric: {
    id: 'course.assessment.question.rubricPlayground.unsavedRubric',
    defaultMessage: 'Unsaved',
  },
  returnToEditing: {
    id: 'course.assessment.question.rubricPlayground.returnToEditing',
    defaultMessage: 'Return to Editing',
  },
  restartEditing: {
    id: 'course.assessment.question.rubricPlayground.restartEditing',
    defaultMessage: 'Restart Editing from Here',
  },
  restart: {
    id: 'course.assessment.question.rubricPlayground.restart',
    defaultMessage: 'Restart',
  },
  discardChanges: {
    id: 'course.assessment.question.rubricPlayground.discardChanges',
    defaultMessage: 'Discard Changes',
  },
  deleteRubricFailure: {
    id: 'course.assessment.question.rubricPlayground.deleteRubricFailure',
    defaultMessage: 'Could not delete this rubric revision.',
  },
  confirmDiscardChangesTitle: {
    id: 'course.assessment.question.rubricPlayground.confirmDiscardChangesTitle',
    defaultMessage: 'Confirm Discard Changes',
  },
  confirmDiscardChangesText: {
    id: 'course.assessment.question.rubricPlayground.confirmDiscardChangesText',
    defaultMessage: 'Your unsaved rubric changes will be lost.',
  },
  confirmRestartEditingTitle: {
    id: 'course.assessment.question.rubricPlayground.confirmRestartEditingTitle',
    defaultMessage: 'Confirm Restart Editing',
  },
  confirmRestartEditingText: {
    id: 'course.assessment.question.rubricPlayground.confirmRestartEditingText',
    defaultMessage:
      'Your unsaved rubric changes will be replaced with this revision.',
  },
  viewEditRubric: {
    id: 'course.assessment.question.rubricPlayground.viewEditRubric',
    defaultMessage: 'View / Edit Rubric',
  },
  evaluate: {
    id: 'course.assessment.question.rubricPlayground.evaluate',
    defaultMessage: 'Evaluate',
  },
  compare: {
    id: 'course.assessment.question.rubricPlayground.compare',
    defaultMessage: 'Compare',
  },
  apply: {
    id: 'course.assessment.question.rubricPlayground.apply',
    defaultMessage: 'Apply',
  },
  applyOnlyActiveRubric: {
    id: 'course.assessment.question.rubricPlayground.applyOnlyActiveRubric',
    defaultMessage:
      'Only the active rubric revision may be used to apply edits to existing grades.',
  },
  showOnlyLatestAnswers: {
    id: 'course.assessment.question.rubricPlayground.showOnlyLatestAnswers',
    defaultMessage: 'Show only current answers',
  },
  setAsActive: {
    id: 'course.assessment.question.rubricPlayground.setAsActive',
    defaultMessage: 'Set as Active',
  },
  confirmSetActiveTitle: {
    id: 'course.assessment.question.rubricPlayground.confirmSetActiveTitle',
    defaultMessage: 'Warning: Setting Incompatible Revision as Active',
  },
  confirmSetActiveText: {
    id: 'course.assessment.question.rubricPlayground.confirmSetActiveText',
    defaultMessage:
      'This revision is structurally incompatible with existing grades. We will carry forward grading data, but we strongly recommend double-checking answer grades as some data may be lost. Are you sure you wish to proceed?',
  },
  confirmAIGradingApplication: {
    id: 'course.assessment.question.rubricPlayground.confirmAIGradingApplication',
    defaultMessage: 'Confirm AI Grading Application',
  },
  applyingRubricGradingData: {
    id: 'course.assessment.question.rubricPlayground.applyingRubricGradingData',
    defaultMessage: 'Applying rubric grading data...',
  },
  applySuccess: {
    id: 'course.assessment.question.rubricPlayground.applySuccess',
    defaultMessage: 'Grading rubric, prompt, and results successfully applied.',
  },
  applyFailure: {
    id: 'course.assessment.question.rubricPlayground.applyFailure',
    defaultMessage: 'Failed to apply grading results',
  },
  notLatestRevisionWarning: {
    id: 'course.assessment.question.rubricPlayground.notLatestRevisionWarning',
    defaultMessage:
      'You have selected to apply a rubric which is not the latest revision saved on this page.',
  },
  applyWillGradeAllAnswers: {
    id: 'course.assessment.question.rubricPlayground.applyWillGradeAllAnswers',
    defaultMessage:
      'Applying this rubric will assign grades to all student answers, including the ones not yet evaluated on this page.',
  },
  applyReplacesSavedResults: {
    id: 'course.assessment.question.rubricPlayground.applyReplacesSavedResults',
    defaultMessage:
      "Applying replaces the saved grade and comment of the selected answers with the active rubric's evaluation results.",
  },
  applySelected: {
    id: 'course.assessment.question.rubricPlayground.applySelected',
    defaultMessage: 'Apply {count} selected',
  },
  evaluateSelected: {
    id: 'course.assessment.question.rubricPlayground.evaluateSelected',
    defaultMessage: 'Evaluate {count} selected',
  },
  confirmApplyUnevaluatedTitle: {
    id: 'course.assessment.question.rubricPlayground.confirmApplyUnevaluatedTitle',
    defaultMessage: 'Confirm Direct Application for Answers',
  },
  confirmApplyUnevaluatedText: {
    id: 'course.assessment.question.rubricPlayground.confirmApplyUnevaluatedText',
    defaultMessage:
      'Some of the answers you are applying have not been evaluated against the active rubric yet. We will evaluate them as part of the application process, but evaluating them before applying will allow you to see the results here before affecting real student grades. Are you sure you wish to proceed?',
  },
  applyRow: {
    id: 'course.assessment.question.rubricPlayground.applyRow',
    defaultMessage: 'Apply this evaluation to the student',
  },
  searchByStudentName: {
    id: 'course.assessment.question.rubricPlayground.searchByStudentName',
    defaultMessage: 'Search by student name',
  },
  submissionStatus: {
    id: 'course.assessment.question.rubricPlayground.submissionStatus',
    defaultMessage: 'Status',
  },
  currentGrade: {
    id: 'course.assessment.question.rubricPlayground.currentGrade',
    defaultMessage: 'Current Grade',
  },
  evaluationGrade: {
    id: 'course.assessment.question.rubricPlayground.evaluationGrade',
    defaultMessage: 'New Grade',
  },
  evaluationComment: {
    id: 'course.assessment.question.rubricPlayground.evaluationComment',
    defaultMessage: 'Feedback',
  },
  gradingStatus: {
    id: 'course.assessment.question.rubricPlayground.gradingStatus',
    defaultMessage: 'Grading Status',
  },
  gradingStatusModified: {
    id: 'course.assessment.question.rubricPlayground.gradingStatusModified',
    defaultMessage: 'Modified',
  },
  gradingStatusIncomplete: {
    id: 'course.assessment.question.rubricPlayground.gradingStatusIncomplete',
    defaultMessage: 'Incomplete',
  },
  gradingStatusStale: {
    id: 'course.assessment.question.rubricPlayground.gradingStatusStale',
    defaultMessage: 'Stale',
  },
  gradingStatusUpToDate: {
    id: 'course.assessment.question.rubricPlayground.gradingStatusUpToDate',
    defaultMessage: 'Up-to-date',
  },
  gradingStatusManuallyGraded: {
    id: 'course.assessment.question.rubricPlayground.gradingStatusManuallyGraded',
    defaultMessage: 'Manually graded',
  },
  regradeRow: {
    id: 'course.assessment.question.rubricPlayground.regradeRow',
    defaultMessage:
      'Re-evaluate with the active rubric (does not change the grade)',
  },
  regradeSuccess: {
    id: 'course.assessment.question.rubricPlayground.regradeSuccess',
    defaultMessage: 'Re-evaluation complete.',
  },
  actions: {
    id: 'course.assessment.question.rubricPlayground.actions',
    defaultMessage: 'Actions',
  },
  confirmProceed: {
    id: 'course.assessment.question.rubricPlayground.confirmProceed',
    defaultMessage: 'Are you sure you wish to proceed?',
  },

  // AnswerEvaluationsTableHeader
  sampleAnswerEvaluations: {
    id: 'course.assessment.question.rubricPlayground.sampleAnswerEvaluations',
    defaultMessage: 'Sample Answer Evaluations',
  },
  addSampleAnswers: {
    id: 'course.assessment.question.rubricPlayground.addSampleAnswers',
    defaultMessage: 'Add Sample Answers',
  },
  evaluateAll: {
    id: 'course.assessment.question.rubricPlayground.evaluateAll',
    defaultMessage: 'Evaluate All ({count})',
  },
  reevaluateAll: {
    id: 'course.assessment.question.rubricPlayground.reevaluateAll',
    defaultMessage: 'Re-evaluate All ({count})',
  },
  evaluateRemaining: {
    id: 'course.assessment.question.rubricPlayground.evaluateRemaining',
    defaultMessage: 'Evaluate Remaining ({count})',
  },
  comparingRevisions: {
    id: 'course.assessment.question.rubricPlayground.comparingRevisions',
    defaultMessage: 'Comparing {count} revisions',
  },
  evaluationsDoNotAffectGrades: {
    id: 'course.assessment.question.rubricPlayground.evaluationsDoNotAffectGrades',
    defaultMessage:
      "Evaluations in this table do not affect the grades assigned to students. You can update existing student grades under the 'Apply' button.",
  },

  // AddAnswersPrompt
  addAnswersTitle: {
    id: 'course.assessment.question.rubricPlayground.addAnswersTitle',
    defaultMessage: 'Add Sample Answers',
  },
  addAnswersPromptAction: {
    id: 'course.assessment.question.rubricPlayground.addAnswersPromptAction',
    defaultMessage: 'Add',
  },
  addExistingAnswers: {
    id: 'course.assessment.question.rubricPlayground.addExistingAnswers',
    defaultMessage: 'Add existing answers',
  },
  student: {
    id: 'course.assessment.question.rubricPlayground.student',
    defaultMessage: 'Student',
  },
  questionGrade: {
    id: 'course.assessment.question.rubricPlayground.questionGrade',
    defaultMessage: 'Grade',
  },
  answer: {
    id: 'course.assessment.question.rubricPlayground.answer',
    defaultMessage: 'Answer',
  },
  searchAnswersPlaceholder: {
    id: 'course.assessment.question.rubricPlayground.searchAnswersPlaceholder',
    defaultMessage: 'Search answers by student name or grade',
  },
  addRandomStudentAnswers: {
    id: 'course.assessment.question.rubricPlayground.addRandomStudentAnswers',
    defaultMessage: 'Add {inputComponent} random student answer(s)',
  },
  writeAnswerPlaceholder: {
    id: 'course.assessment.question.rubricPlayground.writeAnswerPlaceholder',
    defaultMessage: 'Write the answer here',
  },
  mockContextHeading: {
    id: 'course.assessment.question.rubricPlayground.mockContextHeading',
    defaultMessage: "'{'{identifier}'}': context",
  },
  mockContextHeadingForumThread: {
    id: 'course.assessment.question.rubricPlayground.mockContextHeadingForumThread',
    defaultMessage: "'{'{identifier}'}': Conversation root of answer post",
  },
  mockContextHeadingSibling: {
    id: 'course.assessment.question.rubricPlayground.mockContextHeadingSibling',
    defaultMessage: "'{'{identifier}'}': answer to \"{title}\"",
  },
  mockContextPlaceholder: {
    id: 'course.assessment.question.rubricPlayground.mockContextPlaceholder',
    defaultMessage: 'Content the grader would see for this context',
  },

  // MockAnswerPrompt
  addMockAnswer: {
    id: 'course.assessment.question.rubricPlayground.addMockAnswer',
    defaultMessage: 'Add Mock Answer',
  },
  editMockAnswer: {
    id: 'course.assessment.question.rubricPlayground.editMockAnswer',
    defaultMessage: 'View/Edit Mock Answer',
  },
  mockAnswerName: {
    id: 'course.assessment.question.rubricPlayground.mockAnswerName',
    defaultMessage: 'Name (optional)',
  },
  // Fallback label shown in the answers table for a mock answer with a blank name.
  mockAnswerPlaceholderTitle: {
    id: 'course.assessment.question.rubricPlayground.mockAnswerPlaceholderTitle',
    defaultMessage: '(Mock Answer)',
  },
  editMockAnswerTooltip: {
    id: 'course.assessment.question.rubricPlayground.editMockAnswerTooltip',
    defaultMessage: 'Click to view or edit this mock answer',
  },

  // AnswerEvaluationsTable
  dismiss: {
    id: 'course.assessment.question.rubricPlayground.dismiss',
    defaultMessage: 'Dismiss',
  },
  noAnswers: {
    id: 'course.assessment.question.rubricPlayground.noAnswers',
    defaultMessage:
      'No sample answers have been added. Add some to get started.',
  },
  reevaluate: {
    id: 'course.assessment.question.rubricPlayground.reevaluate',
    defaultMessage: 'Re-evaluate',
  },
  totalGrade: {
    id: 'course.assessment.question.rubricPlayground.totalGrade',
    defaultMessage: 'Total',
  },
  feedback: {
    id: 'course.assessment.question.rubricPlayground.feedback',
    defaultMessage: 'Feedback',
  },
  evaluating: {
    id: 'course.assessment.question.rubricPlayground.evaluating',
    defaultMessage: 'Evaluating',
  },
  applying: {
    id: 'course.assessment.question.rubricPlayground.applying',
    defaultMessage: 'Applying',
  },
  categoryHeading: {
    id: 'course.assessment.question.rubricPlayground.categoryHeading',
    defaultMessage: 'C{index}',
  },

  // RubricEditForm
  gradingPrompt: {
    id: 'course.assessment.question.rubricPlayground.gradingPrompt',
    defaultMessage: 'Grading Prompt',
  },
  gradingPromptDescription: {
    id: 'course.assessment.question.rubricPlayground.gradingPromptDescription',
    defaultMessage:
      'Instructions to guide the AI in grading and giving feedback.',
  },
  modelAnswer: {
    id: 'course.assessment.question.rubricPlayground.modelAnswer',
    defaultMessage: 'Model Answer',
  },
  modelAnswerDescription: {
    id: 'course.assessment.question.rubricPlayground.modelAnswerDescription',
    defaultMessage: 'An example that scores the maximum for each category.',
  },
  gradingCategories: {
    id: 'course.assessment.question.rubricPlayground.gradingCategories',
    defaultMessage: 'Grading Categories',
  },
});

export default translations;
