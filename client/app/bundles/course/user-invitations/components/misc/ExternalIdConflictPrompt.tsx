import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { InvitationUpdatedItem } from 'types/course/userInvitations';

import useTranslation from 'lib/hooks/useTranslation';

import ExternalIdConflictTable from '../tables/ExternalIdConflictTable';

interface Props {
  pendingInvitationUpdates: InvitationUpdatedItem[];
  pendingCourseUserUpdates: InvitationUpdatedItem[];
  onKeepExisting: () => void;
  onReplaceAll: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const translations = defineMessages({
  title: {
    id: 'course.userInvitations.ExternalIdConflictPrompt.title',
    defaultMessage: 'Confirm External ID Updates',
  },
  body: {
    id: 'course.userInvitations.ExternalIdConflictPrompt.body',
    defaultMessage:
      'These users are already enrolled or have pending invitations. No new invitation emails will be sent to them. Would you like to keep their current External IDs, or replace them with the values from your file?',
  },
  pendingInvitationUpdates: {
    id: 'course.userInvitations.ExternalIdConflictPrompt.pendingInvitationUpdates',
    defaultMessage: 'Pending Invitation Updates ({count})',
  },
  pendingCourseUserUpdates: {
    id: 'course.userInvitations.ExternalIdConflictPrompt.pendingCourseUserUpdates',
    defaultMessage: 'Pending Course Member Updates ({count})',
  },
  goBack: {
    id: 'course.userInvitations.ExternalIdConflictPrompt.goBack',
    defaultMessage: 'Go Back',
  },
  keepExisting: {
    id: 'course.userInvitations.ExternalIdConflictPrompt.keepExisting',
    defaultMessage: 'Keep Existing',
  },
  replace: {
    id: 'course.userInvitations.ExternalIdConflictPrompt.replace',
    defaultMessage: 'Replace',
  },
});

const ExternalIdConflictPrompt: FC<Props> = ({
  pendingInvitationUpdates,
  pendingCourseUserUpdates,
  onKeepExisting,
  onReplaceAll,
  onCancel,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      disableEscapeKeyDown
      maxWidth="md"
      onClose={(_event, reason) => {
        if (disabled) return;
        if (reason !== 'backdropClick') onCancel();
      }}
      open
    >
      <DialogTitle>{t(translations.title)}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t(translations.body)}</DialogContentText>

        {pendingInvitationUpdates.length > 0 && (
          <>
            <Typography sx={{ mt: 2, mb: 1 }} variant="subtitle2">
              {t(translations.pendingInvitationUpdates, {
                count: pendingInvitationUpdates.length,
              })}
            </Typography>
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <ExternalIdConflictTable rows={pendingInvitationUpdates} />
            </Box>
          </>
        )}

        {pendingCourseUserUpdates.length > 0 && (
          <>
            <Typography sx={{ mt: 2, mb: 1 }} variant="subtitle2">
              {t(translations.pendingCourseUserUpdates, {
                count: pendingCourseUserUpdates.length,
              })}
            </Typography>
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <ExternalIdConflictTable rows={pendingCourseUserUpdates} />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onCancel} variant="outlined">
          {t(translations.goBack)}
        </Button>
        <Button
          disabled={disabled}
          onClick={onKeepExisting}
          variant="contained"
        >
          {t(translations.keepExisting)}
        </Button>
        <Button disabled={disabled} onClick={onReplaceAll} variant="contained">
          {t(translations.replace)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExternalIdConflictPrompt;
