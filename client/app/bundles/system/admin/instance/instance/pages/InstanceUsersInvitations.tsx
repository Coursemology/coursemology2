import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

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
});

const InstanceUsersInvitations: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const invitations = useAppSelector(getAllInvitationMiniEntities);

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

      <UserInvitationsTable invitations={invitations} />
    </>
  );
};

export default injectIntl(InstanceUsersInvitations);
