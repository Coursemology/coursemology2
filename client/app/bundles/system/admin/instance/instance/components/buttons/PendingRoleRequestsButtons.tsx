import { FC, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages } from 'react-intl';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import AcceptButton from 'lib/components/core/buttons/AcceptButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { ROLE_REQUEST_ROLES } from 'lib/constants/sharedConstants';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';
import equal from 'fast-deep-equal';
import EmailButton from 'lib/components/core/buttons/EmailButton';
import useTranslation from 'lib/hooks/useTranslation';
import { approveRoleRequest, rejectRoleRequest } from '../../operations';
import RejectWithMessageForm from '../forms/RejectWithMessageForm';

interface Props {
  roleRequest: RoleRequestRowData;
}

const translations = defineMessages({
  approveTooltip: {
    id: 'roleRequests.approve',
    defaultMessage: 'Approve',
  },
  approveSuccess: {
    id: 'roleRequests.approve.success',
    defaultMessage: '{name} has been approved as {role}',
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
  const { roleRequest } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const onApprove = (): Promise<void> => {
    setIsApproving(true);
    return dispatch(approveRoleRequest(roleRequest))
      .then(() => {
        toast.success(
          t(translations.approveSuccess, {
            name: roleRequest.name,
            role: roleRequest.role,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.approveFailure, {
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
          t(translations.rejectSuccess, {
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
          t(translations.rejectFailure, {
            error: errorMessage,
          }),
        );
        throw error;
      });
  };

  const managementButtons = (
    <div className="whitespace-nowrap">
      <AcceptButton
        tooltip={t(translations.approveTooltip)}
        className={`role-request-approve-${roleRequest.id} mr-4 p-0`}
        disabled={isApproving || isDeleting}
        onClick={onApprove}
      />
      <EmailButton
        tooltip={t(translations.rejectMessageTooltip)}
        className={`role-request-reject-message-${roleRequest.id} mr-4 p-0`}
        disabled={isApproving || isDeleting}
        onClick={onRejectWithMessage}
      />
      <DeleteButton
        tooltip={t(translations.rejectTooltip)}
        className={`role-request-reject-${roleRequest.id} p-0`}
        disabled={isApproving || isDeleting}
        loading={isDeleting}
        onClick={onReject}
        confirmMessage={t(translations.rejectConfirm, {
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
        <RejectWithMessageForm
          open={isRejectDialogOpen}
          roleRequest={roleRequest}
          onClose={(): void => setIsRejectDialogOpen(false)}
        />
      )}
    </>
  );
};

export default memo(PendingRoleRequestsButtons, (prevProps, nextProps) => {
  return equal(prevProps.roleRequest, nextProps.roleRequest);
});
