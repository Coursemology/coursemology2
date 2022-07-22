import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';

import { FolderFormData } from 'types/course/material/folders';
import { toast } from 'react-toastify';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';

import FolderForm from '../../components/forms/FolderForm';
import { createFolder } from '../../operations';

interface Props extends WrappedComponentProps {
  folderId: number;
  isOpen: boolean;
  handleClose: () => void;
}

const translations = defineMessages({
  newSubfolderTitle: {
    id: 'course.materials.folders.newSubfolderTitle',
    defaultMessage: 'New Folder',
  },
  folderCreationSuccess: {
    id: 'course.materials.folders.folderCreationSuccess',
    defaultMessage: 'New folder created',
  },
  folderCreationFailure: {
    id: 'course.materials.folders.folderCreationFailure',
    defaultMessage: 'Folder could not be created',
  },
});

const initialValues = {
  name: '',
  description: null,
  canStudentUpload: false,
  startAt: new Date(),
  endAt: null,
};

const FolderNew: FC<Props> = (props) => {
  const { intl, folderId, isOpen, handleClose } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  if (!isOpen) {
    return null;
  }

  const onSubmit = (data: FolderFormData, setError): void => {
    console.log(data);
    dispatch(createFolder(data, folderId))
      .then((_) => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.folderCreationSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.folderCreationFailure));

        if (error.response?.data) {
          // Replace start_at and end_at with startAt and endAt
          if (error.response.data.errors.start_at) {
            error.response.data.errors.startAt =
              error.response.data.errors.start_at;
            delete error.response.data.errors.start_at;
          }
          if (error.response.data.errors.end_at) {
            error.response.data.errors.endAt =
              error.response.data.errors.end_at;
            delete error.response.data.errors.end_at;
          }
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });
  };

  return (
    <>
      <Dialog
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={isOpen}
        maxWidth="xl"
      >
        <DialogTitle>
          {intl.formatMessage(translations.newSubfolderTitle)}
        </DialogTitle>
        <DialogContent>
          <FolderForm
            editing={false}
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

export default injectIntl(FolderNew);
