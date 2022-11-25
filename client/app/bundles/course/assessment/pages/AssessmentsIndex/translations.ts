import { defineMessages } from 'react-intl';

const translations = defineMessages({
  newAssessment: {
    id: 'course.assessment.newAssessment',
    defaultMessage: 'New Assessment',
  },
  creationSuccess: {
    id: 'course.assessment.create.success',
    defaultMessage: 'Assessment was created.',
  },
  creationFailure: {
    id: 'course.assessment.create.fail',
    defaultMessage: 'Failed to create assessment.',
  },
  createAsDraft: {
    id: 'course.assessment.create.createAsDraft',
    defaultMessage: 'Create As Draft',
  },
  openingSoon: {
    id: 'course.assessments.index.openingSoon',
    defaultMessage: 'This assessment will be unlocked at a later time.',
  },
  unlockableHint: {
    id: 'course.assessments.index.unlockableHint',
    defaultMessage: 'Unlock this assessment by completing its requirements.',
  },
  unavailable: {
    id: 'course.assessments.index.unavailable',
    defaultMessage: 'Unavailable',
  },
  unavailableHint: {
    id: 'course.assessments.index.unavailableHint',
    defaultMessage:
      'You cannot attempt this assessment because you are not a user in this course.',
  },
  title: {
    id: 'course.assessments.index.title',
    defaultMessage: 'Title',
  },
  autograded: {
    id: 'course.assessments.index.autograded',
    defaultMessage: 'Autograded',
  },
  passwordProtected: {
    id: 'course.assessments.index.passwordProtected',
    defaultMessage: 'Password-protected',
  },
  hasPersonalTimes: {
    id: 'course.assessments.index.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  hasPersonalTimesHint: {
    id: 'course.assessments.index.hasPersonalTimesHint',
    defaultMessage:
      "Timings for this assessment will automatically be adjusted based on students' learning rate.",
  },
  affectsPersonalTimes: {
    id: 'course.assessments.index.affectsPersonalTimes',
    defaultMessage: 'Affects personal times',
  },
  affectsPersonalTimesHint: {
    id: 'course.assessments.index.affectsPersonalTimesHint',
    defaultMessage:
      'Completion of this assessment may affect the timings for subsequent assessments.',
  },
  exp: {
    id: 'course.assessments.index.exp',
    defaultMessage: 'EXP',
  },
  bonusExp: {
    id: 'course.assessments.index.bonusExp',
    defaultMessage: 'Bonus',
  },
  neededFor: {
    id: 'course.assessments.index.neededFor',
    defaultMessage: 'Needed for',
  },
  startsAt: {
    id: 'course.assessments.index.startsAt',
    defaultMessage: 'Starts at',
  },
  endsAt: {
    id: 'course.assessments.index.endsAt',
    defaultMessage: 'Ends at',
  },
  bonusEndsAt: {
    id: 'course.assessments.index.bonusEndsAt',
    defaultMessage: 'Bonus ends at',
  },
  attempt: {
    id: 'course.assessments.index.attempt',
    defaultMessage: 'Attempt',
  },
  resume: {
    id: 'course.assessments.index.resume',
    defaultMessage: 'Resume',
  },
  unlock: {
    id: 'course.assessments.index.unlock',
    defaultMessage: 'Unlock',
  },
  view: {
    id: 'course.assessments.index.view',
    defaultMessage: 'View',
  },
  editAssessment: {
    id: 'course.assessments.index.editAssessment',
    defaultMessage: 'Edit Assessment',
  },
  submissions: {
    id: 'course.assessments.index.submissions',
    defaultMessage: 'Submissions',
  },
  hasOngoingSubmissions: {
    id: 'course.assessments.index.hasOngoingSubmissions',
    defaultMessage: 'You have an ongoing submission.',
  },
  needsPasswordToAccess: {
    id: 'course.assessments.index.needsPasswordToAccess',
    defaultMessage: 'You will need a password to access this assessment.',
  },
  draft: {
    id: 'course.assessments.index.draft',
    defaultMessage: 'Draft',
  },
  draftHint: {
    id: 'course.assessments.index.draftHint',
    defaultMessage: 'Only you and staff can see this assessment.',
  },
});

export default translations;
