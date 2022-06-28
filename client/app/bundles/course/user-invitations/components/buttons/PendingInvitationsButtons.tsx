import { FC, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import EmailButton from 'lib/components/buttons/EmailButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { InvitationRowData } from 'types/course/userInvitations';
import sharedConstants from 'lib/constants/sharedConstants';
import equal from 'fast-deep-equal';
import { resendInvitationEmail, deleteInvitation } from '../../operations';

interface Props extends WrappedComponentProps {
  invitation: InvitationRowData;
}

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
    defaultMessage: 'Failed to resend invitation. {error}',
  },
  deletionTooltip: {
    id: 'course.userInvitations.delete',
    defaultMessage: 'Delete Invitation',
  },
  deletionConfirm: {
    id: 'course.userInvitations.delete.confirm',
    defaultMessage:
      'Are you sure you wish to delete invitation to {role} {name} ({email})?',
  },
  deletionSuccess: {
    id: 'course.userInvitations.delete.success',
    defaultMessage: 'Invitation for {name} was deleted.',
  },
  deletionFailure: {
    id: 'course.userInvitations.delete.fail',
    defaultMessage: 'Failed to delete user. {error}',
  },
});

const ROLES = sharedConstants.COURSE_USER_ROLES;

const PendingInvitationsButtons: FC<Props> = (props) => {
  const { intl, invitation } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isResending, setIsResending] = useState(false);

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
        toast.error(
          intl.formatMessage(translations.resendFailure, {
            error: error.message,
          }),
        );
        throw error;
      })
      .finally(() => setIsResending(false));
  };

  const onDelete = (): Promise<void> => {
    return dispatch(deleteInvitation(invitation.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.deletionSuccess, {
            name: invitation.name,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            error,
          }),
        );
        throw error;
      });
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }}>
      <EmailButton
        tooltip={intl.formatMessage(translations.resendTooltip)}
        className={`invitation-resend-${invitation.id}`}
        disabled={isResending}
        onClick={onResend}
      />
      <DeleteButton
        tooltip={intl.formatMessage(translations.deletionTooltip)}
        className={`invitation-delete-${invitation.id}`}
        disabled={isResending}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: ROLES[invitation.role],
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
