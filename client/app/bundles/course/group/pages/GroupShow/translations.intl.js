import { defineMessages } from 'react-intl';

const translations = defineMessages({
  fetchFailure: {
    id: 'course.group.fetchFailure',
    defaultMessage: 'Failed to fetch group data! Please reload and try again.',
  },
  noCategory: {
    id: 'course.group.noCategory',
    defaultMessage: "You don't have a group category created! Create one now!",
  },
  noGroups: {
    id: 'course.group.noGroup',
    defaultMessage:
      "You don't have any groups under this category! Manage groups now to get started!",
  },
  categoryHeaderSubtitle: {
    id: 'course.group.categoryHeaderSubtitle',
    defaultMessage:
      '{numGroups} {numGroups, plural, one {group} other {groups}}',
  },
  noDescription: {
    id: 'course.group.noDescription',
    defaultMessage: 'No description available.',
  },
  editCategory: {
    id: 'course.group.editCategory',
    defaultMessage: 'Edit',
  },
  manageGroups: {
    id: 'course.group.manageGroups',
    defaultMessage: 'Manage Groups',
  },
  editCategoryHeader: {
    id: 'course.group.form.editCategory',
    defaultMessage: 'Edit Category',
  },
  deleteCategorySuccess: {
    id: 'course.group.deleteCategory.success',
    defaultMessage: '{categoryName} was successfully deleted.',
  },
  deleteCategoryFailure: {
    id: 'course.group.deleteCategory.fail',
    defaultMessage: 'Failed to delete {categoryName}.',
  },
  updateCategorySuccess: {
    id: 'course.group.updateCategory.success',
    defaultMessage: '{categoryName} was successfully updated.',
  },
  updateCategoryFailure: {
    id: 'course.group.updateCategory.fail',
    defaultMessage: 'Failed to update {categoryName}.',
  },
  newGroup: {
    id: 'course.group.form.newGroup',
    defaultMessage: 'New Group(s)',
  },
});

export default translations;
