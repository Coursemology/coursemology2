import { defineMessages } from 'react-intl';

export default defineMessages({
  publish: {
    id: 'course.marketplace.publish',
    defaultMessage: 'Publish to Marketplace',
  },
  remove: {
    id: 'course.marketplace.remove',
    defaultMessage: 'Remove from Marketplace',
  },
  publishConfirmTitle: {
    id: 'course.marketplace.publishConfirmTitle',
    defaultMessage: 'Publish to Marketplace?',
  },
  publishConfirmBody: {
    id: 'course.marketplace.publishConfirmBody',
    defaultMessage:
      'This assessment will be browsable by eligible users, who can preview and duplicate it. It uses this assessment’s own title.',
  },
  removeConfirmTitle: {
    id: 'course.marketplace.removeConfirmTitle',
    defaultMessage: 'Remove from Marketplace?',
  },
  removeConfirmBody: {
    id: 'course.marketplace.removeConfirmBody',
    defaultMessage:
      'It will no longer appear in the marketplace. Existing copies are unaffected.',
  },
  published: {
    id: 'course.marketplace.publishedToast',
    defaultMessage: 'Published to the marketplace.',
  },
  removed: {
    id: 'course.marketplace.removedToast',
    defaultMessage: 'Removed from the marketplace.',
  },
  publishFailed: {
    id: 'course.marketplace.publishFailedToast',
    defaultMessage: 'Failed to publish to the marketplace. Please try again.',
  },
  removeFailed: {
    id: 'course.marketplace.removeFailedToast',
    defaultMessage: 'Failed to remove from the marketplace. Please try again.',
  },
  publishNewVersion: {
    id: 'course.marketplace.publishNewVersion',
    defaultMessage: 'Publish new version',
  },
  publishNewVersionConfirmTitle: {
    id: 'course.marketplace.publishNewVersionConfirmTitle',
    defaultMessage: 'Publish new version?',
  },
  publishNewVersionConfirmBody: {
    id: 'course.marketplace.publishNewVersionConfirmBody',
    defaultMessage:
      'This freezes the current content of this assessment as the next version and serves it to the marketplace from now on. Courses that already copied this assessment will be told an update is available.',
  },
  newVersionPublished: {
    id: 'course.marketplace.newVersionPublishedToast',
    defaultMessage: 'New version published.',
  },
  newVersionFailed: {
    id: 'course.marketplace.newVersionFailedToast',
    defaultMessage: 'Failed to publish a new version.',
  },
  deleteWarning: {
    id: 'course.marketplace.deleteWarning',
    defaultMessage:
      'This assessment is in the Assessment Marketplace. The listing is not removed: it stays browsable and keeps serving its last published version, and its adoption history and the copies in other courses are preserved. What you lose is the source assessment, so no new version can be published for this listing. To have this assessment unlisted from the marketplace, <mailto>contact us</mailto>.',
  },
  pageTitle: {
    id: 'course.marketplace.pageTitle',
    defaultMessage: 'Assessment Marketplace',
  },
  colTitle: { id: 'course.marketplace.colTitle', defaultMessage: 'Title' },
  colQuestions: {
    id: 'course.marketplace.colQuestions',
    defaultMessage: 'Questions',
  },
  colAdoptions: {
    id: 'course.marketplace.colAdoptions',
    defaultMessage: 'Adoptions',
  },
  colActions: {
    id: 'course.marketplace.colActions',
    defaultMessage: 'Actions',
  },
  colPublished: {
    id: 'course.marketplace.colPublished',
    defaultMessage: 'Published at',
  },
  preview: {
    id: 'course.marketplace.previewAction',
    defaultMessage: 'Preview',
  },
  previewBadge: {
    id: 'course.marketplace.previewBadge',
    defaultMessage: 'Preview',
  },
  duplicateAssessment: {
    id: 'course.marketplace.duplicateAssessment',
    defaultMessage: 'Duplicate Assessment',
  },
  tryItHandsOn: {
    id: 'course.marketplace.tryItHandsOn',
    defaultMessage: 'Try it hands-on',
  },
  tryItHandsOnConfirmTitle: {
    id: 'course.marketplace.tryItHandsOnConfirmTitle',
    defaultMessage: 'Try it hands-on?',
  },
  tryItHandsOnConfirmBody: {
    id: 'course.marketplace.tryItHandsOnConfirmBody',
    defaultMessage:
      'This opens a hands-on preview in a separate sandbox, in a new tab. You may be briefly redirected to sign in. Your own course is not affected.',
  },
  launchPreviewFailed: {
    id: 'course.marketplace.launchPreviewFailed',
    defaultMessage: 'Could not launch the preview.',
  },
  resetSubmission: {
    id: 'course.marketplace.resetSubmission',
    defaultMessage: 'Reset submission',
  },
  resetSubmissionConfirmTitle: {
    id: 'course.marketplace.resetSubmissionConfirmTitle',
    defaultMessage: 'Reset your submission?',
  },
  resetSubmissionConfirmBody: {
    id: 'course.marketplace.resetSubmissionConfirmBody',
    defaultMessage:
      'This clears all your answers for this assessment in the preview sandbox back to a blank state. You’ll stay on this page and can start answering again right away.',
  },
  resetSubmissionSuccess: {
    id: 'course.marketplace.resetSubmissionSuccess',
    defaultMessage: 'Submission reset.',
  },
  resetSubmissionFailed: {
    id: 'course.marketplace.resetSubmissionFailed',
    defaultMessage: 'Could not reset the submission.',
  },
  viewDetails: {
    id: 'course.marketplace.viewDetails',
    defaultMessage: 'View question details',
  },
  searchPlaceholder: {
    id: 'course.marketplace.searchPlaceholder',
    defaultMessage: 'Search by title',
  },
  sortLabel: { id: 'course.marketplace.sortLabel', defaultMessage: 'Sort by' },
  sortMostAdopted: {
    id: 'course.marketplace.sortMostAdopted',
    defaultMessage: 'Most adopted',
  },
  sortNewest: { id: 'course.marketplace.sortNewest', defaultMessage: 'Newest' },
  duplicateN: {
    id: 'course.marketplace.duplicateN',
    defaultMessage:
      '{n, plural, one {Duplicate # assessment} other {Duplicate # assessments}}',
  },
  confirmationQuestion: {
    id: 'course.marketplace.confirmationQuestion',
    defaultMessage: 'Duplicate items?',
  },
  destinationCourse: {
    id: 'course.marketplace.destinationCourse',
    defaultMessage: 'Destination Course',
  },
  pickDestinationTab: {
    id: 'course.marketplace.pickDestinationTab',
    defaultMessage: 'Pick destination tab',
  },
  duplicating: {
    id: 'course.marketplace.duplicating',
    defaultMessage: 'Duplicating',
  },
  // Reuses the duplication bundle's existing id verbatim so formatjs extract dedupes rather than
  // minting a marketplace-only duplicate; marketplace renders the ⊘ unpublished tooltip itself now.
  itemUnpublished: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.itemUnpublished',
    defaultMessage:
      'Items are duplicated as unpublished when duplicating to an existing course.',
  },
  duplicateConfirm: {
    id: 'course.marketplace.duplicateConfirm',
    defaultMessage: 'Duplicate',
  },
  // Fired from pollJob's completion callback, so this reports what already happened. The old copy
  // said "started", which was both malformed ("Duplicating assessment started.") and untrue.
  duplicateCompleted: {
    id: 'course.marketplace.duplicateCompleted',
    defaultMessage:
      '{n, plural, one {Assessment duplicated. } other {Assessments duplicated. }}',
  },
  duplicateFailed: {
    id: 'course.marketplace.duplicateFailed',
    defaultMessage:
      '{n, plural, one {Could not duplicate the assessment} other {Could not duplicate the assessments}}.',
  },
  viewDuplicatedAssessment: {
    id: 'course.marketplace.viewDuplicatedAssessment',
    defaultMessage:
      '{n, plural, one {View assessment} other {View assessments}}',
  },
  selectToDuplicate: {
    id: 'course.marketplace.selectToDuplicate',
    defaultMessage: 'Select to duplicate',
  },
  emptyNoListings: {
    id: 'course.marketplace.emptyNoListings',
    defaultMessage:
      'No assessments have been published to the marketplace yet.',
  },
  emptyNoMatch: {
    id: 'course.marketplace.emptyNoMatch',
    defaultMessage: 'No assessments match your search.',
  },
  // Preview-only copy with no equivalent in course/assessment/translations. Every other renderer
  // label is reused from there; these three have no source and so live locally.
  bonus: {
    id: 'course.marketplace.bonus',
    defaultMessage: 'Bonus',
  },
  noPreviewImage: {
    id: 'course.marketplace.noPreviewImage',
    defaultMessage:
      'The background image for this question cannot be previewed here.',
  },
});
