import { defineMessages } from 'react-intl';

const translations = defineMessages({
  noUsers: {
    id: 'course.users.ManageUsersTable.ManageUsersTable.noUsers',
    defaultMessage: 'There are no users',
  },
  searchText: {
    id: 'course.users.ManageUsersTable.ManageUsersTable.searchText',
    defaultMessage: 'Search by name or email',
  },
  renameSuccess: {
    id: 'course.users.ManageUsersTable.renameSuccess',
    defaultMessage: '{oldName} was renamed to {newName}',
  },
  renameFailure: {
    id: 'course.users.ManageUsersTable.renameFailure',
    defaultMessage: 'Failed to rename {oldName} to {newName}',
  },
  phantomSuccess: {
    id: 'course.users.ManageUsersTable.phantomSuccess',
    defaultMessage:
      '{name} {isPhantom, select, ' +
      'true {is now a phantom user} ' +
      'other {is now a normal user} ' +
      '}.',
  },
  changeRoleSuccess: {
    id: 'course.users.ManageUsersTable.changeRoleSuccess',
    defaultMessage: "Updated {name}'s role to {role}.",
  },
  changeRoleFailure: {
    id: 'course.users.ManageUsersTable.changeRoleFailure',
    defaultMessage: "Failed to update {name}'s role to {role}.",
  },
  changeTimelineSuccess: {
    id: 'course.users.ManageUsersTable.changeTimelineSuccess',
    defaultMessage: "Updated {name}'s reference timeline to {timeline}.",
  },
  changeTimelineFailure: {
    id: 'course.users.ManageUsersTable.changeTimelineFailure',
    defaultMessage:
      "Failed to update {name}'s reference timeline to {timeline}.",
  },
  bulkChangeTimelineSuccess: {
    id: 'course.users.ManageUsersTable.bulkChangeTimelineSuccess',
    defaultMessage:
      "Updated {n, plural, =1 {# student''s} other {# students''}} reference timelines to {timeline}.",
  },
  bulkChangeTimelineFailure: {
    id: 'course.users.ManageUsersTable.bulkChangeTimelineFailure',
    defaultMessage:
      "Failed to update {n, plural, =1 {# student''s} other {# students''}} reference timelines to {timeline}.",
  },
  changeAlgorithmSuccess: {
    id: 'course.users.ManageUsersTable.changeAlgorithmSuccess',
    defaultMessage: "Updated {name}'s timeline algorithm to {timeline}.",
  },
  changeAlgorithmFailure: {
    id: 'course.users.ManageUsersTable.changeAlgorithmFailure',
    defaultMessage:
      "Failed to update {name}'s timeline algorithm to {timeline}.",
  },
  updateFailure: {
    id: 'course.users.ManageUsersTable.updateFailure',
    defaultMessage: 'Failed to update user - {error}',
  },
  defaultTimeline: {
    id: 'course.users.ManageUsersTable.defaultTimeline',
    defaultMessage: 'Default',
  },
  group: {
    id: 'course.users.ManageUsersTable.group',
    defaultMessage: 'Group: {name}',
  },
  selectedNUsers: {
    id: 'course.users.ManageUsersTable.selectedNUsers',
    defaultMessage: 'Selected {n, plural, =1 {# user} other {# users}}',
  },
  assignToTimeline: {
    id: 'course.users.ManageUsersTable.assignToTimeline',
    defaultMessage: 'Assign to timeline',
  },
});

export default translations;
