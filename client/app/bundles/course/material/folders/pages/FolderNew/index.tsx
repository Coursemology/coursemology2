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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  if (!isOpen) {
    return null;
  }

  const onSubmit = (data: FolderFormData, setError): void => {
    setIsSubmitting(true);

    dispatch(createFolder(data, folderId))
      .then((_) => {
        setIsSubmitting(false);
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.folderCreationSuccess));
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast.error(intl.formatMessage(translations.folderCreationFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <>
      <Dialog
        disableEnforceFocus
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={isOpen}
        maxWidth="lg"
        style={{
          top: 40,
        }}
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
            isSubmitting={isSubmitting}
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
