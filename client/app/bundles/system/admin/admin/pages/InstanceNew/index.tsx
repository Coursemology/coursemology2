import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from 'types/store';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { InstanceFormData } from 'types/system/instances';
import { createInstance } from '../../operations';
import InstanceForm from '../../components/forms/InstanceForm';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
}
const translations = defineMessages({
  newAnnouncement: {
    id: 'system.admin.instance.new.newInstance',
    defaultMessage: 'New Instance',
  },
  creationSuccess: {
    id: 'system.admin.instance.new.creationSuccess',
    defaultMessage: 'New instance {name} ({host}) created!',
  },
  creationFailure: {
    id: 'system.admin.instance.new.creationFailure',
    defaultMessage: 'Failed to create new instance.',
  },
});

const initialValues = {
  name: '',
  host: '',
};

const InstanceNew: FC<Props> = (props) => {
  const { intl, open, handleClose } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const onSubmit = (data: InstanceFormData, setError): void => {
    dispatch(createInstance(data))
      .then((_) => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(
          intl.formatMessage(translations.creationSuccess, {
            name: data.name,
            host: data.host,
          }),
        );
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.creationFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <>
      <Dialog
        className="top-10"
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={open}
        maxWidth="lg"
      >
        <DialogTitle>
          {intl.formatMessage(translations.newAnnouncement)}
        </DialogTitle>
        <DialogContent className="min-w-[400px]">
          <InstanceForm
            handleClose={(): void => {
              if (isDirty) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            initialValues={initialValues}
            onSubmit={onSubmit}
            setIsDirty={setIsDirty}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={confirmationDialogOpen}
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default injectIntl(InstanceNew);
