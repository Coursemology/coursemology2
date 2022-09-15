import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { Box, Typography } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { toast } from 'react-toastify';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';
import InstanceUserRoleRequestsTable from '../../components/tables/InstanceUserRoleRequestsTable';
import PendingRoleRequestsButtons from '../../components/buttons/PendingRoleRequestsButtons';
import { fetchRoleRequests } from '../../operations';
import RejectWithMessageDialog from '../../components/misc/RejectWithMessageDialog';
import { getAllRoleRequestsMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.roleRequests.header',
    defaultMessage: 'Role Requests',
  },
  noRoleRequests: {
    id: 'system.admin.roleRequests.noRoleRequests',
    defaultMessage: 'There are no role requests',
  },
  pending: {
    id: 'system.admin.roleRequests.pending',
    defaultMessage: 'Pending Role Requests',
  },
  approved: {
    id: 'system.admin.roleRequests.approved',
    defaultMessage: 'Approved Role Requests',
  },
  rejected: {
    id: 'system.admin.roleRequests.rejected',
    defaultMessage: 'Rejected Role Requests',
  },
  fetchRoleRequestsFailure: {
    id: 'system.admin.roleRequests.fetch.failure',
    defaultMessage: 'Failed to fetch role requests',
  },
});

const InstanceUserRoleRequestsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoleRequest, setCurrentRoleRequest] =
    useState<RoleRequestRowData | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const roleRequests = useSelector((state: AppState) =>
    getAllRoleRequestsMiniEntities(state),
  );
  const pendingRoleRequests = roleRequests.filter(
    (roleRequest) => roleRequest.status === 'pending',
  );
  const approvedRoleRequests = roleRequests.filter(
    (roleRequest) => roleRequest.status === 'approved',
  );
  const rejectedRoleRequests = roleRequests.filter(
    (roleRequest) => roleRequest.status === 'rejected',
  );

  const dispatch = useDispatch<AppDispatch>();

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

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const renderEmptyState = (): JSX.Element | undefined => {
    if (
      pendingRoleRequests.length === 0 &&
      approvedRoleRequests.length === 0 &&
      rejectedRoleRequests.length === 0
    ) {
      return (
        <Typography className="mt-2" variant="body1">
          {intl.formatMessage(translations.noRoleRequests)}
        </Typography>
      );
    }
    return undefined;
  };

  const rejectWithMessageDialog = currentRoleRequest && (
    <RejectWithMessageDialog
      open={isRejectDialogOpen}
      handleClose={(): void => setIsRejectDialogOpen(false)}
      roleRequest={currentRoleRequest}
    />
  );

  const openRejectDialog = (roleRequest: RoleRequestRowData): void => {
    setIsRejectDialogOpen(true);
    setCurrentRoleRequest(roleRequest);
  };

  return (
    <Box>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {renderEmptyState()}
      {pendingRoleRequests.length > 0 && (
        <InstanceUserRoleRequestsTable
          title={intl.formatMessage(translations.pending)}
          roleRequests={pendingRoleRequests}
          pendingRoleRequests
          renderRowActionComponent={(roleRequest): JSX.Element => (
            <PendingRoleRequestsButtons
              roleRequest={roleRequest}
              openRejectDialog={openRejectDialog}
            />
          )}
        />
      )}
      {approvedRoleRequests.length > 0 && (
        <InstanceUserRoleRequestsTable
          title={intl.formatMessage(translations.approved)}
          roleRequests={approvedRoleRequests}
          approvedRoleRequests
        />
      )}
      {rejectedRoleRequests.length > 0 && (
        <InstanceUserRoleRequestsTable
          title={intl.formatMessage(translations.rejected)}
          roleRequests={rejectedRoleRequests}
          rejectedRoleRequests
        />
      )}
      {rejectWithMessageDialog}
    </Box>
  );
};

export default injectIntl(InstanceUserRoleRequestsIndex);
