import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { InvitationResult } from 'types/system/instance/invitations';

import PageHeader from 'lib/components/navigation/PageHeader';

import IndividualInviteForm from '../../components/forms/IndividualInviteForm';
import InvitationResultDialog from '../../components/misc/InvitationResultDialog';
import InstanceUsersTabs from '../../components/navigation/InstanceUsersTabs';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.instance.InstanceUsersInvite.header',
    defaultMessage: 'Invite Users',
  },
  title: {
    id: 'system.admin.instance.instance.InstanceUsersInvite.title',
    defaultMessage: 'Users',
  },
  fetchUsersFailure: {
    id: 'system.admin.instance.instance.InstanceUsersInvite.fetchUsersFailure',
    defaultMessage: 'Failed to fetch users.',
  },
  totalUsers: {
    id: 'system.admin.instance.instance.InstanceUsersInvite.totalUsers',
    defaultMessage:
      'Total Users: {allCount} ({adminCount} Administrators' +
      ', {instructorCount} Instructors, {normalCount} Normal)',
  },
  activeUsers: {
    id: 'system.admin.instance.instance.InstanceUsersInvite.activeUsers',
    defaultMessage:
      'Active Users: {allCount} ({adminCount} Administrators' +
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
