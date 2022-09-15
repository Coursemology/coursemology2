import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { InvitationResult } from 'types/system/instance/invitations';
import InstanceUsersTabs from '../../components/navigation/InstanceUsersTabs';
import IndividualInviteForm from '../../components/forms/IndividualInviteForm';
import InvitationResultDialog from '../../components/misc/InvitationResultDialog';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.users.header',
    defaultMessage: 'Invite Users',
  },
  title: {
    id: 'system.admin.users.title',
    defaultMessage: 'Users',
  },
  fetchUsersFailure: {
    id: 'system.admin.users.fetch.failure',
    defaultMessage: 'Failed to fetch users.',
  },
  totalUsers: {
    id: 'system.admin.users.totalUsers',
    defaultMessage:
      '<strong>Total Users: {allCount}</strong> ({adminCount} Administrators' +
      ', {instructorCount} Instructors, {normalCount} Normal)',
  },
  activeUsers: {
    id: 'system.admin.users.activeUsers',
    defaultMessage:
      '<strong>Active Users: {allCount}</strong> ({adminCount} Administrators' +
      ', {instructorCount} Instructors, {normalCount} Normal){br}' +
      '(active in the past 7 days)',
  },
});

const InstanceUsersInvite: FC<Props> = (props) => {
  const { intl } = props;
  const [showInvitationResultDialog, setShowInvitationResultDialog] =
    useState(false);
  const [invitationResult, setInvitationResult] = useState({});

  const openResultDialog = (result: InvitationResult): void => {
    setInvitationResult(result);
    setShowInvitationResultDialog(true);
  };

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      <InstanceUsersTabs currentTab="invite-users-tab" />
      <IndividualInviteForm openResultDialog={openResultDialog} />
      {showInvitationResultDialog && (
        <InvitationResultDialog
          handleClose={(): void => setShowInvitationResultDialog(false)}
          invitationResult={invitationResult}
        />
      )}
    </>
  );
};

export default injectIntl(InstanceUsersInvite);
