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
  writeCustomAnswer: {
    id: 'course.assessment.question.rubricPlayground.writeCustomAnswer',
    defaultMessage: 'Write a custom answer',
  },
  writeAnswerPlaceholder: {
    id: 'course.assessment.question.rubricPlayground.writeAnswerPlaceholder',
    defaultMessage: 'Write the answer here',
  },

  // AnswerEvaluationsTable
  dismiss: {
    id: 'course.assessment.question.rubricPlayground.dismiss',
    defaultMessage: 'Dismiss',
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
