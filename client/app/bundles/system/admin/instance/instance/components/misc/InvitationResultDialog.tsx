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
import { InvitationResult } from 'types/system/instance/invitations';

import InvitationResultInvitationsTable from '../tables/InvitationResultInvitationsTable';
import InvitationResultUsersTable from '../tables/InvitationResultUsersTable';

interface Props extends WrappedComponentProps {
  handleClose: () => void;
  invitationResult: InvitationResult;
}

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.instance.InvitationResultDialog.header',
    defaultMessage: 'Invitation Summary',
  },
  close: {
    id: 'system.admin.instance.instance.InvitationResultDialog.close',
    defaultMessage: 'Close',
  },
  duplicateInfo: {
    id: 'system.admin.instance.instance.InvitationResultDialog.duplicateInfo',
    defaultMessage:
      'Duplicate users were found in the invitation. Only the first instance of this user is invited.',
  },
  duplicateUsers: {
    id: 'system.admin.instance.instance.InvitationResultDialog.duplicateUsers',
    defaultMessage: 'Users with Duplicate Emails ({count})',
  },
  existingInstanceUsersInfo: {
    id: 'system.admin.instance.instance.InvitationResultDialog.existingInstanceUsersInfo',
    defaultMessage:
      'Existing instance users with this email were found in the invitation. They were not invited.',
  },
  existingInstanceUsers: {
    id: 'system.admin.instance.instance.InvitationResultDialog.existingInstanceUsers',
    defaultMessage: 'Existing Instance Users ({count})',
  },
  existingInvitationsInfo: {
    id: 'system.admin.instance.instance.InvitationResultDialog.existingInvitationsInfo',
    defaultMessage:
      'Existing invitations for these users with this email already exist. They were not invited.',
  },
  existingInvitations: {
    id: 'system.admin.instance.instance.InvitationResultDialog.existingInvitations',
    defaultMessage: 'Existing Invitations ({count})',
  },
  newInstanceUsers: {
    id: 'system.admin.instance.instance.InvitationResultDialog.newInstanceUsers',
    defaultMessage: 'New Instance Users ({count})',
  },
  newInvitations: {
    id: 'system.admin.instance.instance.InvitationResultDialog.newInvitations',
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
    if (reason !== 'backdropClick') {
      handleClose();
    }
  };

  return (
    <Dialog
      className="top-10"
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      onClose={handleDialogClose}
      open
    >
      <DialogTitle>{intl.formatMessage(translations.header)}</DialogTitle>
      <DialogContent>
        {duplicateUsers && duplicateUsers.length > 0 && (
          <div className="duplicates">
            <InvitationResultUsersTable
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
              users={existingInstanceUsers}
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
              title={
                <Typography variant="h6">
                  {intl.formatMessage(translations.newInstanceUsers, {
                    count: newInstanceUsers.length,
                  })}
                </Typography>
              }
              users={newInstanceUsers}
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
