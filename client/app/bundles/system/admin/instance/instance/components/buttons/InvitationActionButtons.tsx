import { FC, memo, useState } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import { InvitationRowData } from 'types/system/instance/invitations';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EmailButton from 'lib/components/core/buttons/EmailButton';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import { deleteInvitation, resendInvitationEmail } from '../../operations';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  invitation: InvitationRowData;
}

const translations = defineMessages({
  resendTooltip: {
    id: 'system.admin.instance.instance.InvitationActionButtons.resendTooltip',
    defaultMessage: 'Resend Invitation',
  },
  resendSuccess: {
    id: 'system.admin.instance.instance.InvitationActionButtons.resendSuccess',
    defaultMessage: 'Resent email invitation to {email}!',
  },
  resendFailure: {
    id: 'system.admin.instance.instance.InvitationActionButtons.resendFailure',
    defaultMessage: 'Failed to resend invitation.',
  },
  deletionTooltip: {
    id: 'system.admin.instance.instance.InvitationActionButtons.deletionTooltip',
    defaultMessage: 'Delete Invitation',
  },
  deletionConfirm: {
    id: 'system.admin.instance.instance.InvitationActionButtons.deletionConfirm',
    defaultMessage:
      'Are you sure you wish to delete invitation to {name} ({email})?',
  },
  deletionSuccess: {
    id: 'system.admin.instance.instance.InvitationActionButtons.deletionSuccess',
    defaultMessage: 'Invitation for {name} was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.instance.instance.InvitationActionButtons.deletionFailure',
    defaultMessage: 'Failed to delete user - {error}',
  },
});

const InvitationActionButtons: FC<Props> = (props) => {
  const { invitation } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isResending, setIsResending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const onResend = (): Promise<void> => {
    setIsResending(true);
    return dispatch(resendInvitationEmail(invitation.id))
      .then(() => {
        toast.success(
          t(translations.resendSuccess, {
            email: invitation.email,
          }),
        );
      })
      .catch(() => {
        toast.error(t(translations.resendFailure));
      })
      .finally(() => setIsResending(false));
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteInvitation(invitation.id))
      .then(() => {
        toast.success(
          t(translations.deletionSuccess, {
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
          t(translations.deletionFailure, {
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
        tooltip={t(translations.resendTooltip)}
      />
      <DeleteButton
        className={`invitation-delete-${invitation.id}`}
        confirmMessage={t(translations.deletionConfirm, {
          name: invitation.name,
          email: invitation.email,
        })}
        disabled={isResending || isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        tooltip={t(translations.deletionTooltip)}
      />
    </div>
  );
};

export default memo(
  InvitationActionButtons,
  (prevProps, nextProps) => {
    return equal(prevProps.invitation, nextProps.invitation);
  },
);
