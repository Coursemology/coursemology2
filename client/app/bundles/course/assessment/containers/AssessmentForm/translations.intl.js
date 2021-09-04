import { defineMessages } from 'react-intl';

const translations = defineMessages({
  title: {
    id: 'course.assessment.form.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.assessment.form.description',
    defaultMessage: 'Description',
  },
  startAt: {
    id: 'course.assessment.form.startAt',
    defaultMessage: 'Start At',
  },
  endAt: {
    id: 'course.assessment.form.endAt',
    defaultMessage: 'End At',
  },
  bonusEndAt: {
    id: 'course.assessment.form.bonusEndAt',
    defaultMessage: 'Bonus End At',
  },
  baseExp: {
    id: 'course.assessment.form.baseExp',
    defaultMessage: 'Base EXP',
  },
  timeBonusExp: {
    id: 'course.assessment.form.timeBonusExp',
    defaultMessage: 'Time Bonus EXP',
  },
  autograded: {
    id: 'course.assessment.form.autograded',
    defaultMessage: 'Autograded',
  },
  blockStudentViewingAfterSubmitted: {
    id: 'course.assessment.form.blockStudentViewingAfterSubmitted',
    defaultMessage: 'Block Students from Viewing Finalized Submissions',
  },
  autogradeTestCasesHint: {
    id: 'course.assessment.form.autogradeTestCasesHint',
    defaultMessage: 'Select test case types for grade and exp calculation:',
  },
  usePublic: {
    id: 'course.assessment.form.usePublic',
    defaultMessage: 'Public',
  },
  usePrivate: {
    id: 'course.assessment.form.usePrivate',
    defaultMessage: 'Private',
  },
  useEvaluation: {
    id: 'course.assessment.form.useEvaluation',
    defaultMessage: 'Evaluation',
  },
  allowPartialSubmission: {
    id: 'course.assessment.form.allowPartialSubmission',
    defaultMessage: 'Allow submission with incorrect answers',
  },
  showMcqAnswer: {
    id: 'course.assessment.form.showMcqAnswer',
    defaultMessage: 'Show MCQ Submit Result',
  },
  showMcqAnswerHint: {
    id: 'course.assessment.form.showMcqAnswerHint',
    defaultMessage: 'Students can try to submit answer to MCQ and get feedback until they get the right answer',
  },
  showPrivate: {
    id: 'course.assessment.form.showPrivate',
    defaultMessage: 'Show private tests',
  },
  showPrivateHint: {
    id: 'course.assessment.form.showPrivateHint',
    defaultMessage:
      'Show private tests to students after the submission is graded and published (For programming questions)',
  },
  showEvaluation: {
    id: 'course.assessment.form.showEvaluation',
    defaultMessage: 'Show evaluation tests',
  },
  showEvaluationHint: {
    id: 'course.assessment.form.showEvaluationHint',
    defaultMessage:
      'Show evaluation tests to students after the submission is graded and published (For programming questions)',
  },
  hasPersonalTimes: {
    id: 'course.assessment.form.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  hasPersonalTimesHint: {
    id: 'course.assessment.form.hasPersonalTimesHint',
    defaultMessage:
      'Timings for this item will be automatically adjusted for users based on learning rate',
  },
  affectsPersonalTimes: {
    id: 'course.assessment.form.affectsPersonalTimes',
    defaultMessage: 'Affects personal times',
  },
  affectsPersonalTimesHint: {
    id: 'course.assessment.form.affectsPersonalTimesHint',
    defaultMessage: 'Student\'s submission time for this item will be taken into account \
      when updating personal times for other items',
  },
  published: {
    id: 'course.assessment.form.published',
    defaultMessage: 'Published',
  },
  autogradedHint: {
    id: 'course.assessment.form.autogradedHint',
    defaultMessage: 'Automatically assign grade and experience points after assessment is \
      submitted. Answers that are not auto-gradable will always receive the maximum grade.',
  },
  modeSwitchingDisabled: {
    id: 'course.assessment.form.modeSwitchingHint',
    defaultMessage: 'Autograded ( Switch to autograded mode is not allowed as there are submissions \
      for the assessment. )',
  },
  skippable: {
    id: 'course.assessment.form.skippable',
    defaultMessage: 'Allow to skip steps',
  },
  layout: {
    id: 'course.assessment.form.layout',
    defaultMessage: 'Layout',
  },
  tabbedView: {
    id: 'course.assessment.form.tabbedView',
    defaultMessage: 'Tabbed View',
  },
  singlePage: {
    id: 'course.assessment.form.singlePage',
    defaultMessage: 'Single Page',
  },
  delayedGradePublication: {
    id: 'course.assessment.form.delayedGradePublication',
    defaultMessage: 'Delayed Grade Publication',
  },
  delayedGradePublicationHint: {
    id: 'course.assessment.form.delayedGradePublicationHint',
    defaultMessage: "When delayed grade publication is enabled, gradings done by course staff will \
      not be immediately shown to the student. To publish all gradings for this assessment, click \
      on the 'Publish Grades' button on the top right of the submissions listing for this assessment.",
  },
  showMcqMrqSolution: {
    id: 'course.assessment.form.showMcqMrqSolution',
    defaultMessage: 'Show MCQ/MRQ Solution(s)',
  },
  showMcqMrqSolutionHint: {
    id: 'course.assessment.form.showMcqMrqSolutionHint',
    defaultMessage: 'Show MCQ/MRQ Solution(s) when grades of submissions have been published.',
  },
  passwordRequired: {
    id: 'course.assessment.form.passwordRequired',
    defaultMessage: 'At least one password is required',
  },
  passwordProtection: {
    id: 'course.assessment.form.passwordProtection',
    defaultMessage: 'Password Protection',
  },
  viewPasswordHint: {
    id: 'course.assessment.form.viewPasswordHint',
    defaultMessage: 'When assessment password is enabled, students are required to input the password in order to \
      view/attempt the assessment.',
  },
  viewPassword: {
    id: 'course.assessment.form.viewPassword',
    defaultMessage: 'Input Assessment Password',
  },
  sessionPasswordHint: {
    id: 'course.assessment.form.sessionPasswordHint',
    defaultMessage: "When submission password is enabled, students are allowed to access their \
      submission once. Further attempts at editing the submission using a different session are \
      not allowed unless the password is provided by the staff. This can be used to prevent \
      students from accessing each other's submissions in exams. You should NOT give the submission password \
      to the students.",
  },
  sessionPassword: {
    id: 'course.assessment.form.sessionPassword',
    defaultMessage: 'Input Submission Password',
  },
  startEndValidationError: {
    id: 'course.assessment.form.startEndValidationError',
    defaultMessage: "Must be after 'Start At'",
  },
  noTestCaseChosenError: {
    id: 'course.assessment.form.noTestCaseChosenError',
    defaultMessage: 'Select at least one type of test case',
  },
  fetchTabFailure: {
    id: 'course.assessment.form.fetchCategoryFailure',
    defaultMessage: 'Loading of Tabs failed. Please refresh the page, or try again.',
  },
  tab: {
    id: 'course.assessment.form.tab',
    defaultMessage: 'Tab',
  },
  enableRandomization: {
    id: 'course.assessment.form.enable_randomization',
    defaultMessage: 'Enable Randomization',
  },
  enableRandomizationHint: {
    id: 'course.assessment.form.enable_randomization_hint',
    defaultMessage: 'Enables randomized assignment of question bundles to students (per question group)',
  },
});

export default translations;
