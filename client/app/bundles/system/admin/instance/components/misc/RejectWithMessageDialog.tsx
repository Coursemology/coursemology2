import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';
import { rejectRoleRequestWithMessage } from '../../operations';
import RejectWithMessageForm from '../forms/RejectWithMessageForm';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
  roleRequest: RoleRequestRowData;
}

const translations = defineMessages({
  header: {
    id: 'roleRequests.header',
    defaultMessage: 'Role Request Rejection',
  },
  rejectSuccess: {
    id: 'roleRequests.reject.success',
    defaultMessage: 'Role request for {name} was rejected.',
  },
  rejectFailure: {
    id: 'roleRequests.reject.fail',
    defaultMessage: 'Failed to reject role request. {error}',
  },
});

const RejectWithMessageDialog: FC<Props> = (props) => {
  const { open, handleClose, roleRequest, intl } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const confirmIfDirty = (): void => {
    if (isDirty) {
      setDiscardDialogOpen(true);
    } else {
      handleClose();
    }
  };

  const onSubmit = (message: string): Promise<void> => {
    setIsLoading(true);

    return dispatch(rejectRoleRequestWithMessage(roleRequest.id, message))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.rejectSuccess, {
            name: roleRequest.name,
          }),
        );
        handleClose();
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.rejectFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <Dialog
        onClose={confirmIfDirty}
        open={open}
        fullWidth
        maxWidth="lg"
        style={{
          top: 0,
        }}
      >
        <DialogTitle>{`${intl.formatMessage(
          translations.header,
        )}`}</DialogTitle>
        <DialogContent>
          <RejectWithMessageForm
            onSubmit={onSubmit}
            setIsDirty={setIsDirty}
            handleClose={confirmIfDirty}
            roleRequest={roleRequest}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        confirmDiscard
        open={discardDialogOpen}
        onCancel={(): void => setDiscardDialogOpen(false)}
        onConfirm={(): void => {
          setDiscardDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default injectIntl(RejectWithMessageDialog);
