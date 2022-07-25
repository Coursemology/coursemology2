import { FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { InvitationResult } from 'types/course/userInvitations';
import HelpIcon from '@mui/icons-material/Help';
import InvitationResultUsersTable from '../tables/InvitationResultUsersTable';
import InvitationResultInvitationsTable from '../tables/InvitationResultInvitationsTable';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
  invitationResult: InvitationResult;
}

const styles = {
  icon: {
    fontSize: '16px',
    marginRight: '4px',
  },
  dialogStyle: {
    top: 40,
    '& .MuiDialog-paper': {
      overflowY: 'hidden',
    },
  },
};

const translations = defineMessages({
  header: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.header',
    defaultMessage: 'Invitation Summary',
  },
  close: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.close',
    defaultMessage: 'Close',
  },
  body: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.body',
    defaultMessage:
      '{newInvitationsCount, plural, =0 {No new users were} one {# new user was} other {# new users were}} invited to Coursemology. ' +
      '{newCourseUsersCount, plural, =0 {No users without Coursemology accounts were} one {# new user without Coursemology account was} other {# new users without Coursemology accounts were}} invited to this course.',
  },
  duplicateInfo: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.duplicateUsers.info',
    defaultMessage:
      'Duplicate users were found in the invitation. Only the first instance of this user will be invited.',
  },
  duplicateUsers: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.duplicateUsers',
    defaultMessage: 'Users with Duplicate Emails ({count})',
  },
  existingCourseUsersInfo: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingCourseUsers.info',
    defaultMessage:
      'Existing course users with this email were found in the invitation. They were not invited.',
  },
  existingCourseUsers: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingCourseUsers',
    defaultMessage: 'Existing Course Users ({count})',
  },
  existingInvitationsInfo: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingInvitations.info',
    defaultMessage:
      'Existing invitations for these users with this email already exist. They were not invited.',
  },
  existingInvitations: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingInvitations',
    defaultMessage: 'Existing Invitations ({count})',
  },
  newCourseUsers: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.newCourseUsers',
    defaultMessage: 'New Course Users ({count})',
  },
  newInvitations: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.newInvitations',
    defaultMessage: 'New Invitations ({count})',
  },
});

const InvitationResultDialog: FC<Props> = (props) => {
  const { open, handleClose, invitationResult, intl } = props;
  const {
    duplicateUsers,
    existingCourseUsers,
    existingInvitations,
    newCourseUsers,
    newInvitations,
  } = invitationResult;

  if (!open) {
    return null;
  }

  const handleDialogClose = (_event: object, reason: string): void => {
    if (reason && reason !== 'backdropClick') {
      handleClose();
    }
  };

  return (
    <Dialog
      onClose={handleDialogClose}
      disableEscapeKeyDown
      open={open}
      fullWidth
      maxWidth="lg"
      sx={styles.dialogStyle}
    >
      <DialogTitle>{`${intl.formatMessage(translations.header)}`}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          {intl.formatMessage(translations.body, {
            newInvitationsCount: newInvitations?.length ?? 0,
            newCourseUsersCount: newCourseUsers?.length ?? 0,
          })}
        </Typography>
        {duplicateUsers && duplicateUsers.length > 0 && (
          <div className="duplicates">
            <InvitationResultUsersTable
              users={duplicateUsers}
              title={
                <Typography variant="h6">
                  <Tooltip
                    title={intl.formatMessage(translations.duplicateInfo)}
                  >
                    <HelpIcon style={styles.icon} />
                  </Tooltip>
                  {intl.formatMessage(translations.duplicateUsers, {
                    count: duplicateUsers.length,
                  })}
                </Typography>
              }
            />
          </div>
        )}
        {existingInvitations && existingInvitations.length > 0 && (
          <div className="existingInvitations">
            <InvitationResultInvitationsTable
              invitations={existingInvitations}
              title={
                <Typography variant="h6">
                  <Tooltip
                    title={intl.formatMessage(
                      translations.existingInvitationsInfo,
                    )}
                  >
                    <HelpIcon style={styles.icon} />
                  </Tooltip>
                  {intl.formatMessage(translations.existingInvitations, {
                    count: existingInvitations.length,
                  })}
                </Typography>
              }
            />
          </div>
        )}
        {existingCourseUsers && existingCourseUsers.length > 0 && (
          <div className="existingCourseUsers">
            <InvitationResultUsersTable
              users={existingCourseUsers}
              title={
                <Typography variant="h6">
                  <Tooltip
                    title={intl.formatMessage(
                      translations.existingCourseUsersInfo,
                    )}
                  >
                    <HelpIcon style={styles.icon} />
                  </Tooltip>
                  {intl.formatMessage(translations.existingCourseUsers, {
                    count: existingCourseUsers.length,
                  })}
                </Typography>
              }
            />
          </div>
        )}
        {newInvitations && newInvitations.length > 0 && (
          <div className="newInvitations">
            <InvitationResultInvitationsTable
              invitations={newInvitations}
              title={
                <Typography variant="h6">
                  {intl.formatMessage(translations.newInvitations, {
                    count: newInvitations.length,
                  })}
                </Typography>
              }
            />
          </div>
        )}
        {newCourseUsers && newCourseUsers.length > 0 && (
          <div className="newCourseUsers">
            <InvitationResultUsersTable
              users={newCourseUsers}
              title={
                <Typography variant="h6">
                  {intl.formatMessage(translations.newCourseUsers, {
                    count: newCourseUsers.length,
                  })}
                </Typography>
              }
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          {intl.formatMessage(translations.close)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(InvitationResultDialog);
