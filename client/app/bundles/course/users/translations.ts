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
  bulkSuspendSuccess: {
    id: 'course.users.ManageUsersTable.bulkSuspendSuccess',
    defaultMessage:
      'Suspended {n, plural, =1 {# student} other {# students}} successfully.',
  },
  bulkSuspendFailure: {
    id: 'course.users.ManageUsersTable.bulkSuspendFailure',
    defaultMessage:
      'Failed to suspend {n, plural, =1 {# student} other {# students}}.',
  },
  bulkUnsuspendSuccess: {
    id: 'course.users.ManageUsersTable.bulkUnsuspendSuccess',
    defaultMessage:
      'Unsuspended {n, plural, =1 {# student} other {# students}} successfully.',
  },
  bulkUnsuspendFailure: {
    id: 'course.users.ManageUsersTable.bulkUnsuspendFailure',
    defaultMessage:
      'Failed to unsuspend {n, plural, =1 {# student} other {# students}}.',
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
  bulkActions: {
    id: 'course.users.ManageUsersTable.bulkActions',
    defaultMessage: 'Bulk Actions',
  },
  assignToTimeline: {
    id: 'course.users.ManageUsersTable.assignToTimeline',
    defaultMessage: 'Assign to timeline',
  },
  suspend: {
    id: 'course.users.ManageUsersTable.suspend',
    defaultMessage: 'Suspend',
  },
  unsuspend: {
    id: 'course.users.ManageUsersTable.unsuspend',
    defaultMessage: 'Unsuspend',
  },
  deletionScheduled: {
    id: 'course.users.ManageUsersTable.deletionScheduled',
    defaultMessage: '{role} {name} ({email}) has been scheduled for deletion.',
  },
  deletionFailure: {
    id: 'course.users.ManageUsersTable.deletionFailure',
    defaultMessage: 'Failed to delete {role} {name} ({email}).',
  },
  deletionConfirm: {
    id: 'course.users.ManageUsersTable.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete {role} {name} ({email})?',
  },
  suspendSuccess: {
    id: 'course.users.ManageUsersTable.suspendSuccess',
    defaultMessage:
      '{name} is now suspended. They cannot access this course until they are unsuspended.',
  },
  suspendFailure: {
    id: 'course.users.ManageUsersTable.suspendFailure',
    defaultMessage: 'Failed to suspend {name}.',
  },
  unsuspendSuccess: {
    id: 'course.users.ManageUsersTable.unsuspendSuccess',
    defaultMessage:
      '{name} is no longer suspended. They can now access the course.',
  },
  unsuspendFailure: {
    id: 'course.users.ManageUsersTable.unsuspendFailure',
    defaultMessage: 'Failed to unsuspend {name}.',
  },
});

export default translations;
