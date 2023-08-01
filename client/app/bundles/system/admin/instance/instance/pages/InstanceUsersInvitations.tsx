import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import PendingInvitationsButtons from '../components/buttons/PendingInvitationsButtons';
import InstanceUsersTabs from '../components/navigation/InstanceUsersTabs';
import UserInvitationsTable from '../components/tables/UserInvitationsTable';
import { fetchInvitations } from '../operations';
import { getAllInvitationMiniEntities } from '../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.header',
    defaultMessage: 'Invitations',
  },
  title: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.title',
    defaultMessage: 'Users',
  },
  failure: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.fetch.failure',
    defaultMessage: 'Failed to fetch invitations.',
  },
  pending: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.pending',
    defaultMessage: 'Pending Invitations',
  },
  accepted: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.accepted',
    defaultMessage: 'Accepted Invitations',
  },
});

const InstanceUsersInvitations: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const invitations = useAppSelector(getAllInvitationMiniEntities);

  const pendingInvitations = invitations.filter(
    (invitation) => !invitation.confirmed,
  );
  const acceptedInvitations = invitations.filter(
    (invitation) => invitation.confirmed,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchInvitations())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() => toast.error(intl.formatMessage(translations.failure)));
  }, [dispatch]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <InstanceUsersTabs currentTab="invitations-tab" />
      <UserInvitationsTable
        invitations={pendingInvitations}
        pendingInvitations
        renderRowActionComponent={(invitation): JSX.Element => (
          <PendingInvitationsButtons invitation={invitation} />
        )}
        title={intl.formatMessage(translations.pending)}
      />
      <UserInvitationsTable
        acceptedInvitations
        invitations={acceptedInvitations}
        title={intl.formatMessage(translations.accepted)}
      />
    </>
  );
};

export default injectIntl(InstanceUsersInvitations);
