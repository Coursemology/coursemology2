import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { InvitationRowData } from 'types/course/userInvitations';
import { AppDispatch } from 'types/store';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EmailButton from 'lib/components/core/buttons/EmailButton';

import { deleteInvitation, resendInvitationEmail } from '../../operations';

interface Props extends WrappedComponentProps {
  invitation: InvitationRowData;
}
const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

const translations = defineMessages({
  resendTooltip: {
    id: 'course.userInvitations.resend',
    defaultMessage: 'Resend Invitation',
  },
  resendSuccess: {
    id: 'course.userInvitations.resend.success',
    defaultMessage: 'Resent email invitation to {email}!',
  },
  resendFailure: {
    id: 'course.userInvitations.resend.fail',
    defaultMessage: 'Failed to resend invitation - {error}',
  },
  deletionTooltip: {
    id: 'course.userInvitations.delete',
    defaultMessage: 'Delete Invitation',
  },
  deletionConfirm: {
    id: 'course.userInvitations.delete.confirm',
    defaultMessage:
      'Are you sure you wish to delete invitation to {name} ({email})?',
  },
  deletionSuccess: {
    id: 'course.userInvitations.delete.success',
    defaultMessage: 'Invitation for {name} was deleted.',
  },
  deletionFailure: {
    id: 'course.userInvitations.delete.fail',
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
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.resendFailure, {
            error: errorMessage,
          }),
        );
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
    <div style={{ whiteSpace: 'nowrap' }}>
      <EmailButton
        className={`invitation-resend-${invitation.id}`}
        disabled={isResending || isDeleting}
        onClick={onResend}
        sx={styles.buttonStyle}
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
        sx={styles.buttonStyle}
        tooltip={intl.formatMessage(translations.deletionTooltip)}
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
