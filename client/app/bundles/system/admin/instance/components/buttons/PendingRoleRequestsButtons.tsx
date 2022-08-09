import { FC, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import AcceptButton from 'lib/components/buttons/AcceptButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';
import equal from 'fast-deep-equal';
import EmailButton from 'lib/components/buttons/EmailButton';
import { approveRoleRequest, rejectRoleRequest } from '../../operations';

interface Props extends WrappedComponentProps {
  roleRequest: RoleRequestRowData;
  openRejectDialog: (roleRequest: RoleRequestRowData) => void;
}
const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

const translations = defineMessages({
  approveTooltip: {
    id: 'roleRequests.approve',
    defaultMessage: 'Approve',
  },
  approveSuccess: {
    id: 'roleRequests.approve.success',
    defaultMessage: 'Approved role request of {name}!',
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
      'Are you sure you wish to reject role request of {role} {name} ({email})?',
  },
  rejectSuccess: {
    id: 'roleRequests.reject.success',
    defaultMessage: 'Role request for {name} was rejected.',
  },
  rejectFailure: {
    id: 'roleRequests.reject.fail',
    defaultMessage: 'Failed to reject role request. {error}',
  },
});

const ROLES = sharedConstants.COURSE_USER_ROLES;

const PendingRoleRequestsButtons: FC<Props> = (props) => {
  const { intl, roleRequest, openRejectDialog } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    openRejectDialog(roleRequest);
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
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.rejectFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }}>
      <AcceptButton
        tooltip={intl.formatMessage(translations.approveTooltip)}
        className={`role-request-approve-${roleRequest.id}`}
        disabled={isApproving || isDeleting}
        onClick={onApprove}
        sx={styles.buttonStyle}
      />
      <EmailButton
        tooltip={intl.formatMessage(translations.rejectMessageTooltip)}
        className={`role-request-reject-message-${roleRequest.id}`}
        disabled={isApproving || isDeleting}
        onClick={onRejectWithMessage}
        sx={styles.buttonStyle}
      />
      <DeleteButton
        tooltip={intl.formatMessage(translations.rejectTooltip)}
        className={`role-request-reject-${roleRequest.id}`}
        disabled={isApproving || isDeleting}
        loading={isDeleting}
        onClick={onReject}
        confirmMessage={intl.formatMessage(translations.rejectConfirm, {
          role: ROLES[roleRequest.role!],
          name: roleRequest.name,
          email: roleRequest.email,
        })}
        sx={styles.buttonStyle}
      />
    </div>
  );

  return managementButtons;
};

export default memo(
  injectIntl(PendingRoleRequestsButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.roleRequest, nextProps.roleRequest);
  },
);
