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
  groupHeaderSubtitle: {
    id: 'course.group.groupHeaderSubtitle',
    defaultMessage:
      '{numMembers} {numMembers, plural, one {member} other {members}}',
  },
  noDescription: {
    id: 'course.group.noDescription',
    defaultMessage: 'No description available.',
  },
  editCategory: {
    id: 'course.group.editCategory',
    defaultMessage: 'Edit',
  },
  editGroup: {
    id: 'course.group.editGroup',
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
  editGroupHeader: {
    id: 'course.group.form.editGroup',
    defaultMessage: 'Edit Group',
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
  deleteGroupSuccess: {
    id: 'course.group.deleteGroup.success',
    defaultMessage: '{groupName} was successfully deleted.',
  },
  deleteGroupFailure: {
    id: 'course.group.deleteGroup.fail',
    defaultMessage: 'Failed to delete {groupName}.',
  },
  updateGroupSuccess: {
    id: 'course.group.updateGroup.success',
    defaultMessage: '{groupName} was successfully updated.',
  },
  updateGroupFailure: {
    id: 'course.group.updateGroup.fail',
    defaultMessage: 'Failed to update {groupName}.',
  },
  newGroup: {
    id: 'course.group.form.newGroup',
    defaultMessage: 'New Group(s)',
  },
  createSingleGroupSuccess: {
    id: 'course.group.createSingleGroup.success',
    defaultMessage: '{groupName} was successfully created.',
  },
  createSingleGroupFailure: {
    id: 'course.group.createSingleGroup.fail',
    defaultMessage: 'Failed to create {groupName}.',
  },
  createMultipleGroupsSuccess: {
    id: 'course.group.createMultipleGroups.success',
    defaultMessage:
      '{numCreated} {numCreated, plural, one {group was} other {groups were}} successfully created.',
  },
  createMultipleGroupsPartialFailure: {
    id: 'course.group.createMultipleGroups.partialFail',
    defaultMessage:
      'Failed to create {numFailed} {numFailed, plural, one {group} other {groups}}.',
  },
  createMultipleGroupsFailure: {
    id: 'course.group.createMultipleGroups.fail',
    defaultMessage: 'Failed to create {numFailed} groups.',
  },
});

export default translations;
