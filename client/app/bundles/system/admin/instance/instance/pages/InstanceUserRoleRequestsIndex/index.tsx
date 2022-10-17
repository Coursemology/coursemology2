import { FC, useEffect, useMemo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { toast } from 'react-toastify';
import InstanceUserRoleRequestsTable from '../../components/tables/InstanceUserRoleRequestsTable';
import PendingRoleRequestsButtons from '../../components/buttons/PendingRoleRequestsButtons';
import { fetchRoleRequests } from '../../operations';
import { getAllRoleRequestsMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.roleRequests.header',
    defaultMessage: 'Role Request',
  },
  pending: {
    id: 'system.admin.instance.roleRequests.pending',
    defaultMessage: 'Pending Role Request',
  },
  approved: {
    id: 'system.admin.instance.roleRequests.approved',
    defaultMessage: 'Approved Role Request',
  },
  rejected: {
    id: 'system.admin.instance.roleRequests.rejected',
    defaultMessage: 'Rejected Role Request',
  },
  fetchRoleRequestsFailure: {
    id: 'system.admin.instance.roleRequests.fetch.failure',
    defaultMessage: 'Failed to fetch role request',
  },
});

const InstanceUserRoleRequestsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const roleRequests = useSelector((state: AppState) =>
    getAllRoleRequestsMiniEntities(state),
  );
  const dispatch = useDispatch<AppDispatch>();
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

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <InstanceUserRoleRequestsTable
            title={intl.formatMessage(translations.pending)}
            roleRequests={pendingRoleRequests}
            pendingRoleRequests
            renderRowActionComponent={(roleRequest): JSX.Element => (
              <PendingRoleRequestsButtons roleRequest={roleRequest} />
            )}
          />
          <InstanceUserRoleRequestsTable
            title={intl.formatMessage(translations.approved)}
            roleRequests={approvedRoleRequests}
            approvedRoleRequests
          />
          <InstanceUserRoleRequestsTable
            title={intl.formatMessage(translations.rejected)}
            roleRequests={rejectedRoleRequests}
            rejectedRoleRequests
          />
        </>
      )}
    </>
  );
};

export default injectIntl(InstanceUserRoleRequestsIndex);
