import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'course.programmingUpgrade.header',
    defaultMessage: 'Upgrade Programming Questions',
  },
  assessment: {
    id: 'course.programmingUpgrade.assessment',
    defaultMessage: 'Assessment',
  },
  question: {
    id: 'course.programmingUpgrade.question',
    defaultMessage: 'Question',
  },
  submissionCount: {
    id: 'course.programmingUpgrade.submissionCount',
    defaultMessage: '# Submissions',
  },
  language: {
    id: 'course.programmingUpgrade.language',
    defaultMessage: 'Language',
  },
  status: {
    id: 'course.programmingUpgrade.status',
    defaultMessage: 'Status',
  },
  actions: {
    id: 'course.programmingUpgrade.actions',
    defaultMessage: 'Actions',
  },
  statusDeprecated: {
    id: 'course.programmingUpgrade.statusDeprecated',
    defaultMessage: 'Deprecated',
  },
  statusUpgradable: {
    id: 'course.programmingUpgrade.statusUpgradable',
    defaultMessage: 'Upgradable',
  },
  statusPending: {
    id: 'course.programmingUpgrade.statusPending',
    defaultMessage: 'Pending',
  },
  statusOk: {
    id: 'course.programmingUpgrade.statusOk',
    defaultMessage: 'Ok',
  },
  statusImportFailed: {
    id: 'course.programmingUpgrade.statusImportFailed',
    defaultMessage: 'Import Failed',
  },
  upgrade: {
    id: 'course.programmingUpgrade.upgrade',
    defaultMessage: 'Upgrade',
  },
  revert: {
    id: 'course.programmingUpgrade.revert',
    defaultMessage: 'Revert to {language}',
  },
  editQuestion: {
    id: 'course.programmingUpgrade.editQuestion',
    defaultMessage: 'View / Edit Question',
  },
  upgradeSelected: {
    id: 'course.programmingUpgrade.upgradeSelected',
    defaultMessage: 'Upgrade Selected ({count})',
  },
  deprecatedLanguage: {
    id: 'course.programmingUpgrade.deprecatedLanguage',
    defaultMessage: 'This version is deprecated and should be upgraded.',
  },
  noUpgradeAvailable: {
    id: 'course.programmingUpgrade.noUpgradeAvailable',
    defaultMessage: 'No newer version is available for this language.',
  },
  regradeWarning: {
    id: 'course.programmingUpgrade.regradeWarning',
    defaultMessage:
      'There are existing submissions for {questionCount, plural, one {this autograded question} ' +
      'other {these # autograded questions}}. Upgrading will re-import ' +
      '{questionCount, plural, one {its package} other {their packages}} and regrade approximately ' +
      '{answerCount, plural, one {# submitted answer} other {# submitted answers}}, and only ' +
      'system-issued EXP for those submissions will be re-calculated. Note that manually-issued EXP ' +
      'will not be updated. Are you sure you wish to continue?',
  },
  upgradeStarted: {
    id: 'course.programmingUpgrade.upgradeStarted',
    defaultMessage:
      'Started {count, plural, one {# upgrade} other {# upgrades}}.',
  },
  upgradeRejected: {
    id: 'course.programmingUpgrade.upgradeRejected',
    defaultMessage:
      '{count, plural, one {# question was} other {# questions were}} skipped.',
  },
  upgradeFailed: {
    id: 'course.programmingUpgrade.upgradeFailed',
    defaultMessage: 'Could not start the upgrade.',
  },
  revertStarted: {
    id: 'course.programmingUpgrade.revertStarted',
    defaultMessage: 'Reverting the question to its previous language.',
  },
  revertFailed: {
    id: 'course.programmingUpgrade.revertFailed',
    defaultMessage: 'Could not revert the question.',
  },
  searchPlaceholder: {
    id: 'course.programmingUpgrade.searchPlaceholder',
    defaultMessage: 'Search by question or assessment title',
  },
});
