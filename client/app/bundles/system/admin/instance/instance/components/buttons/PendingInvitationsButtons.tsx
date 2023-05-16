import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { InvitationRowData } from 'types/system/instance/invitations';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EmailButton from 'lib/components/core/buttons/EmailButton';
import { useAppDispatch } from 'lib/hooks/store';

import { deleteInvitation, resendInvitationEmail } from '../../operations';

interface Props extends WrappedComponentProps {
  invitation: InvitationRowData;
}

const translations = defineMessages({
  resendTooltip: {
    id: 'system.admin.instance.instance.PendingInvitationsButtons.resendTooltip',
    defaultMessage: 'Resend Invitation',
  },
  resendSuccess: {
    id: 'system.admin.instance.instance.PendingInvitationsButtons.resendSuccess',
    defaultMessage: 'Resent email invitation to {email}!',
  },
  resendFailure: {
    id: 'system.admin.instance.instance.PendingInvitationsButtons.resendFailure',
    defaultMessage: 'Failed to resend invitation.',
  },
  deletionTooltip: {
    id: 'system.admin.instance.instance.PendingInvitationsButtons.deletionTooltip',
    defaultMessage: 'Delete Invitation',
  },
  deletionConfirm: {
    id: 'system.admin.instance.instance.PendingInvitationsButtons.deletionConfirm',
    defaultMessage:
      'Are you sure you wish to delete invitation to {name} ({email})?',
  },
  deletionSuccess: {
    id: 'system.admin.instance.instance.PendingInvitationsButtons.deletionSuccess',
    defaultMessage: 'Invitation for {name} was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.instance.instance.PendingInvitationsButtons.deletionFailure',
    defaultMessage: 'Failed to delete user - {error}',
  },
});

const PendingInvitationsButtons: FC<Props> = (props) => {
  const { intl, invitation } = props;
  const dispatch = useAppDispatch();
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

  return (
    <div className="whitespace-nowrap">
      <EmailButton
        className={`invitation-resend-${invitation.id} p-0`}
        disabled={isResending || isDeleting}
        onClick={onResend}
        tooltip={intl.formatMessage(translations.resendTooltip)}
      />
      <DeleteButton
        className={`invitation-delete-${invitation.id}`}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          name: invitation.name,
          email: invitation.email,
        })}
        disabled={isResending || isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        tooltip={intl.formatMessage(translations.deletionTooltip)}
      />
    </div>
  );
};

export default memo(
  injectIntl(PendingInvitationsButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.invitation, nextProps.invitation);
  },
);
