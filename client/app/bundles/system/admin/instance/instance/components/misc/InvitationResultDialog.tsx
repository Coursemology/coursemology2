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
import { InvitationResult } from 'types/system/instance/invitations';
import HelpIcon from '@mui/icons-material/Help';
import InvitationResultUsersTable from '../tables/InvitationResultUsersTable';
import InvitationResultInvitationsTable from '../tables/InvitationResultInvitationsTable';

interface Props extends WrappedComponentProps {
  handleClose: () => void;
  invitationResult: InvitationResult;
}

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.header',
    defaultMessage: 'Invitation Summary',
  },
  close: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.close',
    defaultMessage: 'Close',
  },
  duplicateInfo: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.duplicateUsers.info',
    defaultMessage:
      'Duplicate users were found in the invitation. Only the first instance of this user is invited.',
  },
  duplicateUsers: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.duplicateUsers',
    defaultMessage: 'Users with Duplicate Emails ({count})',
  },
  existingInstanceUsersInfo: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.existingInstanceUsers.info',
    defaultMessage:
      'Existing instance users with this email were found in the invitation. They were not invited.',
  },
  existingInstanceUsers: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.existingInstanceUsers',
    defaultMessage: 'Existing Instance Users ({count})',
  },
  existingInvitationsInfo: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.existingInvitations.info',
    defaultMessage:
      'Existing invitations for these users with this email already exist. They were not invited.',
  },
  existingInvitations: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.existingInvitations',
    defaultMessage: 'Existing Invitations ({count})',
  },
  newInstanceUsers: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.newInstanceUsers',
    defaultMessage: 'New Instance Users ({count})',
  },
  newInvitations: {
    id: 'system.admin.instance.userInvitations.components.misc.InvitationResultDialog.newInvitations',
    defaultMessage: 'New Invitations ({count})',
  },
});

const InvitationResultDialog: FC<Props> = (props) => {
  const { handleClose, invitationResult, intl } = props;
  const {
    duplicateUsers,
    existingInstanceUsers,
    existingInvitations,
    newInstanceUsers,
    newInvitations,
  } = invitationResult;

  const handleDialogClose = (_event: object, reason: string): void => {
    if (reason && reason !== 'backdropClick') {
      handleClose();
    }
  };

  return (
    <Dialog
      className="top-10"
      onClose={handleDialogClose}
      disableEscapeKeyDown
      open
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>{`${intl.formatMessage(translations.header)}`}</DialogTitle>
      <DialogContent>
        {duplicateUsers && duplicateUsers.length > 0 && (
          <div className="duplicates">
            <InvitationResultUsersTable
              users={duplicateUsers}
              title={
                <Typography variant="h6">
                  <Tooltip
                    title={intl.formatMessage(translations.duplicateInfo)}
                  >
                    <HelpIcon className="mr-1 text-3xl" />
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
                    <HelpIcon className="mr-1 text-3xl" />
                  </Tooltip>
                  {intl.formatMessage(translations.existingInvitations, {
                    count: existingInvitations.length,
                  })}
                </Typography>
              }
            />
          </div>
        )}
        {existingInstanceUsers && existingInstanceUsers.length > 0 && (
          <div className="existingInstanceUsers">
            <InvitationResultUsersTable
              users={existingInstanceUsers}
              title={
                <Typography variant="h6">
                  <Tooltip
                    title={intl.formatMessage(
                      translations.existingInstanceUsersInfo,
                    )}
                  >
                    <HelpIcon className="mr-1 text-3xl" />
                  </Tooltip>
                  {intl.formatMessage(translations.existingInstanceUsers, {
                    count: existingInstanceUsers.length,
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
        {newInstanceUsers && newInstanceUsers.length > 0 && (
          <div className="newInstanceUsers">
            <InvitationResultUsersTable
              users={newInstanceUsers}
              title={
                <Typography variant="h6">
                  {intl.formatMessage(translations.newInstanceUsers, {
                    count: newInstanceUsers.length,
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
