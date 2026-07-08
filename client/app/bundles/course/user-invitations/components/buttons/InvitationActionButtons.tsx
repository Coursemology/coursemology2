import { FC, memo, useState } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import { InvitationMiniEntity } from 'types/course/userInvitations';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EmailButton from 'lib/components/core/buttons/EmailButton';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteInvitation, resendInvitationEmail } from '../../operations';

interface Props {
  invitation: InvitationMiniEntity;
  isRetryable?: boolean;
}

const translations = defineMessages({
  resendTooltip: {
    id: 'course.userInvitations.InvitationActionButtons.resendTooltip',
    defaultMessage: 'Resend Invitation',
  },
  resendSuccess: {
    id: 'course.userInvitations.InvitationActionButtons.resendSuccess',
    defaultMessage: 'Resent email invitation to {email}!',
  },
  resendFailure: {
    id: 'course.userInvitations.InvitationActionButtons.resendFailure',
    defaultMessage: 'Failed to resend invitation.',
  },
  deletionTooltip: {
    id: 'course.userInvitations.InvitationActionButtons.deletionTooltip',
    defaultMessage: 'Delete Invitation',
  },
  deletionConfirm: {
    id: 'course.userInvitations.InvitationActionButtons.deletionConfirm',
    defaultMessage:
      'Are you sure you wish to delete invitation to {name} ({email})?',
  },
  deletionSuccess: {
    id: 'course.userInvitations.InvitationActionButtons.deletionSuccess',
    defaultMessage: 'Invitation for {name} was deleted.',
  },
  deletionFailure: {
    id: 'course.userInvitations.InvitationActionButtons.deletionFailure',
    defaultMessage: 'Failed to delete user - {error}',
  },
  deletionFailureGeneric: {
    id: 'course.userInvitations.InvitationActionButtons.deletionFailureGeneric',
    defaultMessage: 'Failed to delete user.',
  },
});

const InvitationActionButtons: FC<Props> = (props) => {
  const { invitation, isRetryable } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
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
        // resend failure endpoints return head :bad_request with no body
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
        const rawErrors = error.response?.data?.errors;
        let errorList: string[];
        if (Array.isArray(rawErrors)) errorList = rawErrors;
        else if (typeof rawErrors === 'string') errorList = [rawErrors];
        else errorList = [];
        if (errorList[0]) {
          toast.error(t(translations.deletionFailure, { error: errorList[0] }));
        } else {
          toast.error(t(translations.deletionFailureGeneric));
        }
      });
  };

  return (
    <div className="flex whitespace-nowrap space-x-3">
      <EmailButton
        className={`invitation-resend-${invitation.id}`}
        disabled={isResending || isDeleting || !isRetryable}
        onClick={onResend}
        tooltip={isRetryable ? t(translations.resendTooltip) : undefined}
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

export default memo(InvitationActionButtons, (prevProps, nextProps) => {
  return equal(prevProps.invitation, nextProps.invitation);
});
