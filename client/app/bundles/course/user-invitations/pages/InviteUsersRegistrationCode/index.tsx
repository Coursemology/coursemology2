import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import {
  fetchRegistrationCode,
  toggleRegistrationCode,
} from '../../operations';
import { getCourseRegistrationKey } from '../../selectors';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
}

const styles = {
  registrationCode: {
    fontSize: '500%',
    cursor: 'pointer',
  },
};

const translations = defineMessages({
  registrationCode: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.registrationCode',
    defaultMessage: 'Registration Code',
  },
  registrationCodeInfo: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.registrationCodeInfo',
    defaultMessage:
      'Users having difficulty registering with their email invitation\
        can use this registration code to register instead.',
  },
  registrationCodeNote: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.registrationCodeNote',
    defaultMessage:
      'Users who have been invited and use this invitation code to register for the course \
       would not have the proper status reflected in the Invitations page.',
  },
  currentlyDisabled: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.currentlyDisabled',
    defaultMessage:
      'Registration via registration codes is currently disabled.',
  },
  enable: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.enable',
    defaultMessage: 'Enable Registration Code',
  },
  disable: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.disable',
    defaultMessage: 'Disable Registration Code',
  },
  enableSuccess: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.enableSuccess',
    defaultMessage: 'Successfully enabled registration code!',
  },
  disableSuccess: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.disableSuccess',
    defaultMessage: 'Successfully disabled registration code!',
  },
  cancel: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.cancel',
    defaultMessage: 'Cancel',
  },
  copy: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.copy',
    defaultMessage: 'Copy to clipboard',
  },
  copySuccess: {
    id: 'course.userInvitation.InviteUsersRegistrationCode.copySuccess',
    defaultMessage: 'Copied registration code to clipboard!',
  },
});
const InviteUsersRegistrationCode: FC<Props> = (props) => {
  const { open, handleClose, intl } = props;
  const [isLoading, setIsLoading] = useState(false);

  const registrationCode = useAppSelector(getCourseRegistrationKey);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      dispatch(fetchRegistrationCode());
    }
  }, [dispatch, open]);

  const handleToggleRegistrationCode = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(toggleRegistrationCode(registrationCode.length === 0))
      .then(() => {
        if (registrationCode.length > 0) {
          toast.success(intl.formatMessage(translations.disableSuccess));
        } else {
          toast.success(intl.formatMessage(translations.enableSuccess));
        }
      })
      .finally(() => setIsLoading(false));
  };

  if (!open) {
    return null;
  }

  const renderRegistrationCode = (
    <Tooltip title={intl.formatMessage(translations.copy)}>
      <pre
        onClick={(): void => {
          navigator.clipboard.writeText(registrationCode);
          toast.info(intl.formatMessage(translations.copySuccess));
        }}
        role="presentation"
        style={styles.registrationCode}
      >
        {registrationCode}
      </pre>
    </Tooltip>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      onClose={handleClose}
      open={open}
      style={{
        top: 40,
      }}
    >
      <DialogTitle>
        {`${intl.formatMessage(translations.registrationCode)}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            {intl.formatMessage(translations.registrationCodeInfo)}
            <br />
            {intl.formatMessage(translations.registrationCodeNote)}
          </Alert>
          {registrationCode.length > 0 ? (
            renderRegistrationCode
          ) : (
            <Typography variant="body2">
              {intl.formatMessage(translations.currentlyDisabled)}
            </Typography>
          )}
        </Stack>
        <Grid
          container
          justifyContent="space-between"
          sx={{ marginTop: '24px' }}
        >
          <LoadingButton
            className="toggle-registration-code"
            loading={isLoading}
            onClick={handleToggleRegistrationCode}
            variant="contained"
          >
            {registrationCode.length > 0
              ? intl.formatMessage(translations.disable)
              : intl.formatMessage(translations.enable)}
          </LoadingButton>
          <Button color="secondary" onClick={handleClose}>
            {intl.formatMessage(translations.cancel)}
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default injectIntl(InviteUsersRegistrationCode);
