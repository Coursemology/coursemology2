import { defineMessages } from 'react-intl';

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.userInvitations.InvitationsIndex.manageUsersHeader',
    defaultMessage: 'Manage Users',
  },
  failure: {
    id: 'course.userInvitations.InvitationsIndex.failure',
    defaultMessage: 'Failed to fetch all invitations',
  },
  invitationsInfo: {
    id: 'course.userInvitations.InvitationsIndex.invitationsInfo',
    defaultMessage:
      'The page lists all invitations which have been sent out to date.{br}Users can key in their invitation code into the course registration page to manually register into this course.',
  },
  invitationsHeader: {
    id: 'course.userInvitations.InvitationsIndex.invitationsHeader',
    defaultMessage: 'Invitations',
  },
  noInvitations: {
    id: 'course.userInvitations.UserInvitationsTable.noInvitations',
    defaultMessage: 'There are no invitations.',
  },
  pending: {
    id: 'course.userInvitations.UserInvitationsTable.pending',
    defaultMessage: 'Pending',
  },
  accepted: {
    id: 'course.userInvitations.UserInvitationsTable.accepted',
    defaultMessage: 'Accepted',
  },
  failed: {
    id: 'course.userInvitations.UserInvitationsTable.failed',
    defaultMessage: 'Failed',
  },
  sentTooltip: {
    id: 'course.userInvitations.UserInvitationsTable.sentTooltip',
    defaultMessage: 'Sent {sentAt}',
  },
  confirmedTooltip: {
    id: 'course.userInvitations.UserInvitationsTable.confirmedTooltip',
    defaultMessage: 'Accepted {confirmedAt}',
  },
});

export default translations;
