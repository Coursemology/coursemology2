import { defineMessages } from 'react-intl';

const translations = defineMessages({
  title: {
    id: 'course.assessment.AssessmentForm.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.assessment.AssessmentForm.description',
    defaultMessage: 'Description',
  },
  startAt: {
    id: 'course.assessment.AssessmentForm.startAt',
    defaultMessage: 'Starts at *',
  },
  endAt: {
    id: 'course.assessment.AssessmentForm.endAt',
    defaultMessage: 'Ends at',
  },
  bonusEndAt: {
    id: 'course.assessment.AssessmentForm.bonusEndAt',
    defaultMessage: 'Bonus ends at',
  },
  baseExp: {
    id: 'course.assessment.AssessmentForm.baseExp',
    defaultMessage: 'Base EXP',
  },
  timeBonusExp: {
    id: 'course.assessment.AssessmentForm.timeBonusExp',
    defaultMessage: 'Time Bonus EXP',
  },
  blockStudentViewingAfterSubmitted: {
    id: 'course.assessment.AssessmentForm.blockStudentViewingAfterSubmitted',
    defaultMessage: 'Block students from viewing finalized submissions',
  },
  blockStudentViewingAfterSubmittedHint: {
    id: 'course.assessment.AssessmentForm.blockStudentViewingAfterSubmittedHint',
    defaultMessage:
      'Students will only be able to view their submissions after their grades have been published.',
  },
  usePublic: {
    id: 'course.assessment.AssessmentForm.usePublic',
    defaultMessage: 'Public test cases',
  },
  usePrivate: {
    id: 'course.assessment.AssessmentForm.usePrivate',
    defaultMessage: 'Private test cases',
  },
  useEvaluation: {
    id: 'course.assessment.AssessmentForm.useEvaluation',
    defaultMessage: 'Evaluation test cases',
  },
  allowPartialSubmission: {
    id: 'course.assessment.AssessmentForm.allowPartialSubmission',
    defaultMessage: 'Allow submission with incorrect answers',
  },
  showMcqAnswer: {
    id: 'course.assessment.AssessmentForm.showMcqAnswer',
    defaultMessage: 'Show MCQ submit result',
  },
  showMcqAnswerHint: {
    id: 'course.assessment.AssessmentForm.showMcqAnswerHint',
    defaultMessage:
      'When enabled, students can try to submit MCQ answers and get feedback until they get it right.',
  },
  showPrivate: {
    id: 'course.assessment.AssessmentForm.showPrivate',
    defaultMessage: 'Show private test cases',
  },
  showEvaluation: {
    id: 'course.assessment.AssessmentForm.showEvaluation',
    defaultMessage: 'Show evaluation test cases',
  },
  forProgrammingQuestions: {
    id: 'course.assessment.AssessmentForm.forProgrammingQuestions',
    defaultMessage: 'for programming questions.',
  },
  hasPersonalTimes: {
    id: 'course.assessment.AssessmentForm.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  hasPersonalTimesHint: {
    id: 'course.assessment.AssessmentForm.hasPersonalTimesHint',
    defaultMessage:
      'Timings for this item will be automatically adjusted for users based on learning rate.',
  },
  affectsPersonalTimes: {
    id: 'course.assessment.AssessmentForm.affectsPersonalTimes',
    defaultMessage: 'Affects personal times',
  },
  affectsPersonalTimesHint: {
    id: 'course.assessment.AssessmentForm.affectsPersonalTimesHint',
    defaultMessage:
      "Student's submission time for this item will be taken into account \
      when updating personal times for other items.",
  },
  visibility: {
    id: 'course.assessment.AssessmentForm.visibility',
    defaultMessage: 'Visibility',
  },
  published: {
    id: 'course.assessment.AssessmentForm.published',
    defaultMessage: 'Published',
  },
  draft: {
    id: 'course.assessment.AssessmentForm.draft',
    defaultMessage: 'Draft',
  },
  publishedHint: {
    id: 'course.assessment.AssessmentForm.publishedHint',
    defaultMessage: 'Everyone can see this assessment.',
  },
  draftHint: {
    id: 'course.assessment.AssessmentForm.draftHint',
    defaultMessage: 'Only you and staff can see this assessment.',
  },
  hasTodo: {
    id: 'course.assessment.AssessmentForm.hasTodo',
    defaultMessage: 'Has TODO',
  },
  hasTodoHint: {
    id: 'course.assessment.AssessmentForm.hasTodoHint',
    defaultMessage:
      'When enabled, students will see this assessment in their TODO list.',
  },
  gradingMode: {
    id: 'course.assessment.AssessmentForm.gradingMode',
    defaultMessage: 'Grading mode',
  },
  autogradedHint: {
    id: 'course.assessment.AssessmentForm.autogradedHint',
    defaultMessage:
      'Automatically assign grade and EXP upon submission. \
      Non-autogradeable questions will always receive the maximum grade.',
  },
  modeSwitchingDisabled: {
    id: 'course.assessment.AssessmentForm.modeSwitchingHint',
    defaultMessage:
      'You can no longer change the grading mode because there are already submissions \
      for this assessment.',
  },
  containsCodaveriQuestion: {
    id: 'course.assessment.AssessmentForm.containsCodaveriQuestion',
    defaultMessage:
      "Switch to autograded mode is not allowed as there's \
      codaveri programming question type in this assessment. \
      This question type is only supported \
      in manually-graded assessment.",
  },
  calculateGradeWith: {
    id: 'course.assessment.AssessmentForm.calculateGradeWith',
    defaultMessage: 'Calculate grade and EXP with',
  },
  skippable: {
    id: 'course.assessment.AssessmentForm.skippable',
    defaultMessage: 'Allow to skip steps',
  },
  skippableManualHint: {
    id: 'course.assessment.AssessmentForm.skippableManualHint',
    defaultMessage:
      'Students can already move between questions in manually graded assessments.',
  },
  unlockConditions: {
    id: 'course.assessment.AssessmentForm.unlockConditions',
    defaultMessage: 'Unlock conditions',
  },
  unlockConditionsHint: {
    id: 'course.assessment.AssessmentForm.unlockConditionsHint',
    defaultMessage:
      'This assessment will be unlocked if a student meets the following conditions.',
  },
  displayAssessmentAs: {
    id: 'course.assessment.AssessmentForm.displayAssessmentAs',
    defaultMessage: 'Display assessment as',
  },
  tabbedView: {
    id: 'course.assessment.AssessmentForm.tabbedView',
    defaultMessage: 'Tabbed View',
  },
  singlePage: {
    id: 'course.assessment.AssessmentForm.singlePage',
    defaultMessage: 'Single Page',
  },
  delayedGradePublication: {
    id: 'course.assessment.AssessmentForm.delayedGradePublication',
    defaultMessage: 'Enable delayed grade publication',
  },
  delayedGradePublicationHint: {
    id: 'course.assessment.AssessmentForm.delayedGradePublicationHint',
    defaultMessage:
      'When delayed grade publication is on, gradings will not be immediately shown to students. \
      To publish all gradings, you may click Publish Grades in the Submissions page.',
  },
  showMcqMrqSolution: {
    id: 'course.assessment.AssessmentForm.showMcqMrqSolution',
    defaultMessage: 'Show MCQ/MRQ solution(s)',
  },
  passwordRequired: {
    id: 'course.assessment.AssessmentForm.passwordRequired',
    defaultMessage: 'At least one password is required',
  },
  passwordProtection: {
    id: 'course.assessment.AssessmentForm.passwordProtection',
    defaultMessage: 'Enable password protection',
  },
  sessionProtection: {
    id: 'course.assessment.AssessmentForm.sessionProtection',
    defaultMessage: 'Enable session protection',
  },
  sessionProtectionHint: {
    id: 'course.assessment.AssessmentForm.sessionProtectionHint',
    defaultMessage:
      'When session protection is on, students can only access their attempt once. \
      Further access will require the session unlock password.',
  },
  viewPasswordHint: {
    id: 'course.assessment.AssessmentForm.viewPasswordHint',
    defaultMessage:
      'Students need to input this password to View and Attempt this assessment.',
  },
  viewPassword: {
    id: 'course.assessment.AssessmentForm.viewPassword',
    defaultMessage: 'Assessment password',
  },
  sessionPasswordHint: {
    id: 'course.assessment.AssessmentForm.sessionPasswordHint',
    defaultMessage: 'Ideally, do NOT give this password to students.',
  },
  sessionPassword: {
    id: 'course.assessment.AssessmentForm.sessionPassword',
    defaultMessage: 'Session unlock password',
  },
  startEndValidationError: {
    id: 'course.assessment.AssessmentForm.startEndValidationError',
    defaultMessage: 'Must be after starting time',
  },
  noTestCaseChosenError: {
    id: 'course.assessment.AssessmentForm.noTestCaseChosenError',
    defaultMessage: 'Select at least one type of test case',
  },
  fetchTabFailure: {
    id: 'course.assessment.AssessmentForm.fetchCategoryFailure',
    defaultMessage:
      'Loading of Tabs failed. Please refresh the page, or try again.',
  },
  tab: {
    id: 'course.assessment.AssessmentForm.tab',
    defaultMessage: 'Tab',
  },
  enableRandomization: {
    id: 'course.assessment.AssessmentForm.enableRandomization',
    defaultMessage: 'Enable Randomization',
  },
  enableRandomizationHint: {
    id: 'course.assessment.AssessmentForm.enableRandomizationHint',
    defaultMessage:
      'Enables randomized assignment of question bundles to students (per question group).',
  },
  assessmentDetails: {
    id: 'course.assessment.AssessmentForm.assessmentDetails',
    defaultMessage: 'Assessment details',
  },
  gamification: {
    id: 'course.assessment.AssessmentForm.gamification',
    defaultMessage: 'Gamification',
  },
  grading: {
    id: 'course.assessment.AssessmentForm.grading',
    defaultMessage: 'Grading',
  },
  answersAndTestCases: {
    id: 'course.assessment.AssessmentForm.answersAndTestCases',
    defaultMessage: 'Answers and test cases',
  },
  organization: {
    id: 'course.assessment.AssessmentForm.organization',
    defaultMessage: 'Organization',
  },
  examsAndAccessControl: {
    id: 'course.assessment.AssessmentForm.examsAndAccessControl',
    defaultMessage: 'Exams and access control',
  },
  personalisedTimelines: {
    id: 'course.assessment.AssessmentForm.personalisedTimelines',
    defaultMessage: 'Personalised timelines',
  },
  unavailableInAutograded: {
    id: 'course.assessment.AssessmentForm.unavailableInAutograded',
    defaultMessage: 'Unavailable in autograded assessments.',
  },
  unavailableInManuallyGraded: {
    id: 'course.assessment.AssessmentForm.unavailableInManuallyGraded',
    defaultMessage: 'Unavailable in manually graded assessments.',
  },
  afterSubmissionGraded: {
    id: 'course.assessment.AssessmentForm.afterSubmissionGraded',
    defaultMessage: 'After submission is graded and published',
  },
  files: {
    id: 'course.assessment.AssessmentForm.files',
    defaultMessage: 'Files',
  },
});

export default translations;
