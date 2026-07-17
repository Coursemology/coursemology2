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
});
