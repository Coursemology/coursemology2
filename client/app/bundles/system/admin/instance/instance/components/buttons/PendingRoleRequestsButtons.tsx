import { FC, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import AcceptButton from 'lib/components/buttons/AcceptButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { ROLE_REQUEST_ROLES } from 'lib/constants/sharedConstants';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';
import equal from 'fast-deep-equal';
import EmailButton from 'lib/components/buttons/EmailButton';
import { approveRoleRequest, rejectRoleRequest } from '../../operations';
import RejectWithMessageDialog from '../misc/RejectWithMessageDialog';

interface Props extends WrappedComponentProps {
  roleRequest: RoleRequestRowData;
}

const translations = defineMessages({
  approveTooltip: {
    id: 'roleRequests.approve',
    defaultMessage: 'Approve',
  },
  approveSuccess: {
    id: 'roleRequests.approve.success',
    defaultMessage: '{name} has been approved as %{role}',
  },
  approveFailure: {
    id: 'roleRequests.approve.fail',
    defaultMessage: 'Failed to approve role request - {error}',
  },
  rejectTooltip: {
    id: 'roleRequests.reject',
    defaultMessage: 'Reject',
  },
  rejectMessageTooltip: {
    id: 'roleRequests.reject.message',
    defaultMessage: 'Reject with message',
  },
  rejectConfirm: {
    id: 'roleRequests.reject.confirm',
    defaultMessage:
      'Are you sure you wish to reject role request of {name} ({email})?',
  },
  rejectSuccess: {
    id: 'roleRequests.reject.success',
    defaultMessage: 'The role request made by {name} has been rejected.',
  },
  rejectFailure: {
    id: 'roleRequests.reject.fail',
    defaultMessage: 'Failed to reject role request - {error}',
  },
});

const PendingRoleRequestsButtons: FC<Props> = (props) => {
  const { intl, roleRequest } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const onApprove = (): Promise<void> => {
    setIsApproving(true);
    return dispatch(approveRoleRequest(roleRequest))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.approveSuccess, {
            name: roleRequest.name,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.approveFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsApproving(false));
  };

  const onRejectWithMessage = (): void => {
    setIsRejectDialogOpen(true);
  };

  const onReject = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(rejectRoleRequest(roleRequest.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.rejectSuccess, {
            name: roleRequest.name,
          }),
        );
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.rejectFailure, {
            error: errorMessage,
          }),
        );
        throw error;
      });
  };

  const managementButtons = (
    <div className="whitespace-nowrap">
      <AcceptButton
        tooltip={intl.formatMessage(translations.approveTooltip)}
        className={`role-request-approve-${roleRequest.id} p-0 mr-4`}
        disabled={isApproving || isDeleting}
        onClick={onApprove}
      />
      <EmailButton
        tooltip={intl.formatMessage(translations.rejectMessageTooltip)}
        className={`role-request-reject-message-${roleRequest.id} p-0 mr-4`}
        disabled={isApproving || isDeleting}
        onClick={onRejectWithMessage}
      />
      <DeleteButton
        tooltip={intl.formatMessage(translations.rejectTooltip)}
        className={`role-request-reject-${roleRequest.id} p-0`}
        disabled={isApproving || isDeleting}
        loading={isDeleting}
        onClick={onReject}
        confirmMessage={intl.formatMessage(translations.rejectConfirm, {
          role: ROLE_REQUEST_ROLES[roleRequest.role!],
          name: roleRequest.name,
          email: roleRequest.email,
        })}
      />
    </div>
  );

  return (
    <>
      {managementButtons}
      {isRejectDialogOpen && (
        <RejectWithMessageDialog
          roleRequest={roleRequest}
          handleClose={(): void => setIsRejectDialogOpen(false)}
        />
      )}
    </>
  );
};

export default memo(
  injectIntl(PendingRoleRequestsButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.roleRequest, nextProps.roleRequest);
  },
);
