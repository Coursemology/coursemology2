import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'course.admin.common.title',
    defaultMessage: 'Title',
  },
  pagination: {
    id: 'course.admin.common.pagination',
    defaultMessage: 'Pagination',
  },
  paginationMustBePositive: {
    id: 'course.admin.common.paginationMustBePositive',
    defaultMessage: 'Pagination must be greater than zero.',
  },
  leaveEmptyToUseDefaultTitle: {
    id: 'course.admin.common.leaveEmptyToUseDefaultTitle',
    defaultMessage: 'Leave empty to use the default title.',
  },
  deleted: {
    id: 'course.admin.common.deleted',
    defaultMessage: '{title} was successfully deleted.',
  },
  created: {
    id: 'course.admin.common.created',
    defaultMessage: '{title} was successfully created.',
  },
});
