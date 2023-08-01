import { FC, memo, useState } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';

import AcceptButton from 'lib/components/core/buttons/AcceptButton';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EmailButton from 'lib/components/core/buttons/EmailButton';
import { ROLE_REQUEST_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { approveRoleRequest, rejectRoleRequest } from '../../operations';
import RejectWithMessageForm from '../forms/RejectWithMessageForm';

interface Props {
  roleRequest: RoleRequestRowData;
}

const translations = defineMessages({
  approveTooltip: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.approveTooltip',
    defaultMessage: 'Approve',
  },
  approveSuccess: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.approveSuccess',
    defaultMessage: '{name} has been approved as {role}',
  },
  approveFailure: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.approveFailure',
    defaultMessage: 'Failed to approve role request - {error}',
  },
  rejectTooltip: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.rejectTooltip',
    defaultMessage: 'Reject',
  },
  rejectMessageTooltip: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.rejectMessageTooltip',
    defaultMessage: 'Reject with message',
  },
  rejectConfirm: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.rejectConfirm',
    defaultMessage:
      'Are you sure you wish to reject role request of {name} ({email})?',
  },
  rejectSuccess: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.rejectSuccess',
    defaultMessage: 'The role request made by {name} has been rejected.',
  },
  rejectFailure: {
    id: 'system.admin.instance.instance.PendingRoleRequestsButton.rejectFailure',
    defaultMessage: 'Failed to reject role request - {error}',
  },
});

const PendingRoleRequestsButtons: FC<Props> = (props) => {
  const { roleRequest } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
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
        className={`role-request-approve-${roleRequest.id} mr-4 p-0`}
        disabled={isApproving || isDeleting}
        onClick={onApprove}
        tooltip={t(translations.approveTooltip)}
      />
      <EmailButton
        className={`role-request-reject-message-${roleRequest.id} mr-4 p-0`}
        disabled={isApproving || isDeleting}
        onClick={onRejectWithMessage}
        tooltip={t(translations.rejectMessageTooltip)}
      />
      <DeleteButton
        className={`role-request-reject-${roleRequest.id} p-0`}
        confirmMessage={t(translations.rejectConfirm, {
          role: ROLE_REQUEST_ROLES[roleRequest.role!],
          name: roleRequest.name,
          email: roleRequest.email,
        })}
        disabled={isApproving || isDeleting}
        loading={isDeleting}
        onClick={onReject}
        tooltip={t(translations.rejectTooltip)}
      />
    </div>
  );

  return (
    <>
      {managementButtons}
      {isRejectDialogOpen && (
        <RejectWithMessageForm
          onClose={(): void => setIsRejectDialogOpen(false)}
          open={isRejectDialogOpen}
          roleRequest={roleRequest}
        />
      )}
    </>
  );
};

export default memo(PendingRoleRequestsButtons, (prevProps, nextProps) => {
  return equal(prevProps.roleRequest, nextProps.roleRequest);
});
