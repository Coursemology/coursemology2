import { FC, useEffect, useMemo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import PendingRoleRequestsButtons from '../components/buttons/PendingRoleRequestsButtons';
import InstanceUserRoleRequestsTable from '../components/tables/InstanceUserRoleRequestsTable';
import { fetchRoleRequests } from '../operations';
import { getAllRoleRequestsMiniEntities } from '../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsIndex.header',
    defaultMessage: 'Role Request',
  },
  pending: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsIndex.pending',
    defaultMessage: 'Pending Role Request',
  },
  approved: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsIndex.approved',
    defaultMessage: 'Approved Role Request',
  },
  rejected: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsIndex.rejected',
    defaultMessage: 'Rejected Role Request',
  },
  fetchRoleRequestsFailure: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsIndex.fetchRoleRequestsFailure',
    defaultMessage: 'Failed to fetch role request',
  },
});

const InstanceUserRoleRequestsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const roleRequests = useAppSelector(getAllRoleRequestsMiniEntities);
  const dispatch = useAppDispatch();
  const pendingRoleRequests = useMemo(
    () =>
      roleRequests.filter((roleRequest) => roleRequest.status === 'pending'),
    [roleRequests],
  );
  const approvedRoleRequests = useMemo(
    () =>
      roleRequests.filter((roleRequest) => roleRequest.status === 'approved'),
    [roleRequests],
  );
  const rejectedRoleRequests = useMemo(
    () =>
      roleRequests.filter((roleRequest) => roleRequest.status === 'rejected'),
    [roleRequests],
  );

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchRoleRequests())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchRoleRequestsFailure)),
      );
  }, [dispatch]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <InstanceUserRoleRequestsTable
        pendingRoleRequests
        renderRowActionComponent={(roleRequest): JSX.Element => (
          <PendingRoleRequestsButtons roleRequest={roleRequest} />
        )}
        roleRequests={pendingRoleRequests}
        title={intl.formatMessage(translations.pending)}
      />
      <InstanceUserRoleRequestsTable
        approvedRoleRequests
        roleRequests={approvedRoleRequests}
        title={intl.formatMessage(translations.approved)}
      />
      <InstanceUserRoleRequestsTable
        rejectedRoleRequests
        roleRequests={rejectedRoleRequests}
        title={intl.formatMessage(translations.rejected)}
      />
    </>
  );
};

export default injectIntl(InstanceUserRoleRequestsIndex);
