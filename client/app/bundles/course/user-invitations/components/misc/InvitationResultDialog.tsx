import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import HelpIcon from '@mui/icons-material/Help';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { InvitationResult } from 'types/course/userInvitations';

import InvitationResultInvitationsTable from '../tables/InvitationResultInvitationsTable';
import InvitationResultUsersTable from '../tables/InvitationResultUsersTable';

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
    id: 'course.userInvitations.InvitationResultDialog.header',
    defaultMessage: 'Invitation Summary',
  },
  close: {
    id: 'course.userInvitations.InvitationResultDialog.close',
    defaultMessage: 'Close',
  },
  body: {
    id: 'course.userInvitations.InvitationResultDialog.body',
    defaultMessage:
      '{newInvitationsCount, plural, =0 {No new users were} one {# new user has been} other {# new users have been}} invited to Coursemology. ' +
      '{newCourseUsersCount, plural, =0 {No user with Coursemology account has been} one {# new user with existing Coursemology account has been} other {# new users with existing Coursemology accounts have been}} added to this course.',
  },
  duplicateInfo: {
    id: 'course.userInvitations.InvitationResultDialog.duplicateInfo',
    defaultMessage:
      'Duplicate users were found in the invitation. Only the first instance of this user will be invited.',
  },
  duplicateUsers: {
    id: 'course.userInvitations.InvitationResultDialog.duplicateUsers',
    defaultMessage: 'Users with Duplicate Emails ({count})',
  },
  existingCourseUsersInfo: {
    id: 'course.userInvitations.InvitationResultDialog.existingCourseUsersInfo',
    defaultMessage:
      'Existing course users with this email were found in the invitation. They were not invited.',
  },
  existingCourseUsers: {
    id: 'course.userInvitations.InvitationResultDialog.existingCourseUsers',
    defaultMessage: 'Existing Course Users ({count})',
  },
  existingInvitationsInfo: {
    id: 'course.userInvitations.InvitationResultDialog.existingInvitationsInfo',
    defaultMessage:
      'Existing invitations for these users with this email already exist. They were not invited.',
  },
  existingInvitations: {
    id: 'course.userInvitations.InvitationResultDialog.existingInvitations',
    defaultMessage: 'Existing Invitations ({count})',
  },
  newCourseUsers: {
    id: 'course.userInvitations.InvitationResultDialog.newCourseUsers',
    defaultMessage: 'New Course Users ({count})',
  },
  newInvitations: {
    id: 'course.userInvitations.InvitationResultDialog.newInvitations',
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
    if (reason !== 'backdropClick') {
      handleClose();
    }
  };

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      onClose={handleDialogClose}
      open={open}
      sx={styles.dialogStyle}
    >
      <DialogTitle>{intl.formatMessage(translations.header)}</DialogTitle>
      <DialogContent>
        <Typography gutterBottom variant="body2">
          {intl.formatMessage(translations.body, {
            newInvitationsCount: newInvitations?.length ?? 0,
            newCourseUsersCount: newCourseUsers?.length ?? 0,
          })}
        </Typography>
        {duplicateUsers && duplicateUsers.length > 0 && (
          <div className="duplicates">
            <InvitationResultUsersTable
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
              users={duplicateUsers}
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
              users={existingCourseUsers}
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
              title={
                <Typography variant="h6">
                  {intl.formatMessage(translations.newCourseUsers, {
                    count: newCourseUsers.length,
                  })}
                </Typography>
              }
              users={newCourseUsers}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleClose}>
          {intl.formatMessage(translations.close)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(InvitationResultDialog);
