import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import PendingInvitationsButtons from '../../components/buttons/PendingInvitationsButtons';
import InstanceUsersTabs from '../../components/navigation/InstanceUsersTabs';
import UserInvitationsTable from '../../components/tables/UserInvitationsTable';
import { fetchInvitations } from '../../operations';
import { getAllInvitationMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.users.header',
    defaultMessage: 'Invitations',
  },
  title: {
    id: 'system.admin.users.title',
    defaultMessage: 'Users',
  },
  failure: {
    id: 'system.admin.users.invitations.fetch.failure',
    defaultMessage: 'Failed to fetch invitations.',
  },
  noInvitations: {
    id: 'system.admin.users.invitations.noInvitations',
    defaultMessage: 'There are no instance user invitations sent yet.',
  },
  pending: {
    id: 'system.admin.users.invitations.pending.title',
    defaultMessage: 'Pending Invitations',
  },
  accepted: {
    id: 'system.admin.users.invitations.accepted.title',
    defaultMessage: 'Accepted Invitations',
  },
});

const InstanceUsersInvitations: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const invitations = useSelector((state: AppState) =>
    getAllInvitationMiniEntities(state),
  );

  const pendingInvitations = invitations.filter(
    (invitation) => !invitation.confirmed,
  );
  const acceptedInvitations = invitations.filter(
    (invitation) => invitation.confirmed,
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchInvitations())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() => toast.error(intl.formatMessage(translations.failure)));
  }, [dispatch]);

  const renderBody: JSX.Element = (
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

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(InstanceUsersInvitations);
