import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import { getAllInvitationMiniEntities } from '../../selectors';
import InstanceUsersTabs from '../../components/navigation/InstanceUsersTabs';
import { fetchInvitations } from '../../operations';
import UserInvitationsTable from '../../components/tables/UserInvitationsTable';
import PendingInvitationsButtons from '../../components/buttons/PendingInvitationsButtons';

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
      {pendingInvitations.length > 0 && (
        <UserInvitationsTable
          title={intl.formatMessage(translations.pending)}
          invitations={pendingInvitations}
          pendingInvitations
          renderRowActionComponent={(invitation): JSX.Element => (
            <PendingInvitationsButtons invitation={invitation} />
          )}
        />
      )}

      {acceptedInvitations.length > 0 && (
        <UserInvitationsTable
          title={intl.formatMessage(translations.accepted)}
          invitations={acceptedInvitations}
          acceptedInvitations
        />
      )}
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(InstanceUsersInvitations);
