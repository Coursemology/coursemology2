import { FC, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EmailButton from 'lib/components/core/buttons/EmailButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { InvitationRowData } from 'types/system/instance/invitations';
import equal from 'fast-deep-equal';
import { resendInvitationEmail, deleteInvitation } from '../../operations';

interface Props extends WrappedComponentProps {
  invitation: InvitationRowData;
}

const translations = defineMessages({
  resendTooltip: {
    id: 'system.admin.instance.userInvitations.resend',
    defaultMessage: 'Resend Invitation',
  },
  resendSuccess: {
    id: 'system.admin.instance.userInvitations.resend.success',
    defaultMessage: 'Resent email invitation to {email}!',
  },
  resendFailure: {
    id: 'system.admin.instance.userInvitations.resend.fail',
    defaultMessage: 'Failed to resend invitation.',
  },
  deletionTooltip: {
    id: 'system.admin.instance.userInvitations.delete',
    defaultMessage: 'Delete Invitation',
  },
  deletionConfirm: {
    id: 'system.admin.instance.userInvitations.delete.confirm',
    defaultMessage:
      'Are you sure you wish to delete invitation to {name} ({email})?',
  },
  deletionSuccess: {
    id: 'system.admin.instance.userInvitations.delete.success',
    defaultMessage: 'Invitation for {name} was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.instance.userInvitations.delete.fail',
    defaultMessage: 'Failed to delete user - {error}',
  },
});

const PendingInvitationsButtons: FC<Props> = (props) => {
  const { intl, invitation } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isResending, setIsResending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const onResend = (): Promise<void> => {
    setIsResending(true);
    return dispatch(resendInvitationEmail(invitation.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.resendSuccess, {
            email: invitation.email,
          }),
        );
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.resendFailure));
      })
      .finally(() => setIsResending(false));
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteInvitation(invitation.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.deletionSuccess, {
            name: invitation.name,
          }),
        );
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
        throw error;
      });
  };

  const managementButtons = (
    <div className="whitespace-nowrap">
      <EmailButton
        tooltip={intl.formatMessage(translations.resendTooltip)}
        className={`invitation-resend-${invitation.id} p-0`}
        disabled={isResending || isDeleting}
        onClick={onResend}
      />
      <DeleteButton
        tooltip={intl.formatMessage(translations.deletionTooltip)}
        className={`invitation-delete-${invitation.id}`}
        disabled={isResending || isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          name: invitation.name,
          email: invitation.email,
        })}
      />
    </div>
  );

  return managementButtons;
};

export default memo(
  injectIntl(PendingInvitationsButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.invitation, nextProps.invitation);
  },
);
