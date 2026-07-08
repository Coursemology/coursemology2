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
      'This assessment will be browsable by course managers, who can preview and duplicate it. It uses this assessment’s own title and description.',
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
  preview: {
    id: 'course.marketplace.previewAction',
    defaultMessage: 'Preview',
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
});
