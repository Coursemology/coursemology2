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
  passwordProtection: {
    id: 'course.assessment.form.passwordProtection',
    defaultMessage: 'Password Protection',
  },
  passwordProtectionHint: {
    id: 'course.assessment.form.passwordProtectionHint',
    defaultMessage: "When password protection is enabled, students are allowed to access their \
      submission once. Further attempts at editing the submission using a different session are \
      not allowed unless the password is provided by the staff. This can be used to prevent \
      students from accessing each other's submissions in exams.",
  },
  password: {
    id: 'course.assessment.form.password',
    defaultMessage: 'Input Password',
  },
  startEndValidationError: {
    id: 'course.assessment.form.startEndValidationError',
    defaultMessage: "Must be after 'Start At'",
  },
});

export default translations;
