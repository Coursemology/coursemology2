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
      'This assessment will be browsable by course managers, who can preview and duplicate it. It uses this assessment’s own title.',
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
  deleteWarning: {
    id: 'course.marketplace.deleteWarning',
    defaultMessage:
      'This assessment is in the Assessment Marketplace. Deleting it removes it from the marketplace and deletes its adoption history. Existing copies in other courses are unaffected.',
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
  duplicateAssessment: {
    id: 'course.marketplace.duplicateAssessment',
    defaultMessage: 'Duplicate Assessment',
  },
  tryItOut: {
    id: 'course.marketplace.tryItOut',
    defaultMessage: 'Try it out',
  },
  previewSandbox: {
    id: 'course.marketplace.previewSandbox',
    defaultMessage:
      'You’re trying out “{title}” in a private sandbox - explore freely, nothing you enter is kept.',
  },
  previewInertGrading: {
    id: 'course.marketplace.previewInertGrading',
    defaultMessage:
      'Auto-grading is off in previews - grade AI-graded questions by hand.',
  },
  duplicateIntoMyCourse: {
    id: 'course.marketplace.duplicateIntoMyCourse',
    defaultMessage: 'Duplicate into my course',
  },
  errorAttemptingListing: {
    id: 'course.marketplace.attemptLoader.errorAttemptingListing',
    defaultMessage:
      'An error occurred while opening this assessment. Try again later.',
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
  assessmentsHeading: {
    id: 'course.marketplace.assessmentsHeading',
    defaultMessage: 'Assessments',
  },
  duplicateConfirm: {
    id: 'course.marketplace.duplicateConfirm',
    defaultMessage: 'Duplicate',
  },
  duplicateStarted: {
    id: 'course.marketplace.duplicateStarted',
    defaultMessage:
      '{n, plural, one {Duplicating assessment} other {Duplicating assessments}} started.',
  },
  duplicateFailed: {
    id: 'course.marketplace.duplicateFailed',
    defaultMessage:
      '{n, plural, one {Duplicating assessment} other {Duplicating assessments}} failed.',
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
