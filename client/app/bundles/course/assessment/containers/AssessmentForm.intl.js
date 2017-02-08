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
  passwordProtection: {
    id: 'course.assessment.form.passwordProtection',
    defaultMessage: 'Password Protection',
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
