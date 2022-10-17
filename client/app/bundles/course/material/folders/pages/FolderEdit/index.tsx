import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch } from 'types/store';
import { FolderFormData } from 'types/course/material/folders';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import FolderForm from '../../components/forms/FolderForm';
import { updateFolder } from '../../operations';

interface Props extends WrappedComponentProps {
  isOpen: boolean;
  handleClose: () => void;
  folderId: number;
  initialValues: {
    name: string;
    description: string | null;
    canStudentUpload: boolean;
    startAt: Date;
    endAt: Date | null;
  };
}

const translations = defineMessages({
  editSubfolderTitle: {
    id: 'course.materials.folders.editSubfolderTitle',
    defaultMessage: 'Edit Folder',
  },
  folderEditSuccess: {
    id: 'course.materials.folders.folderEditSuccess',
    defaultMessage: 'Folder has been edited',
  },
  folderEditFailure: {
    id: 'course.materials.folders.folderEditFailure',
    defaultMessage: 'Folder could not be edited',
  },
});

const FolderEdit: FC<Props> = (props) => {
  const { intl, isOpen, handleClose, folderId, initialValues } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (data: FolderFormData, setError): void => {
    setIsSubmitting(true);

    dispatch(updateFolder(data, folderId))
      .then((_) => {
        setIsSubmitting(false);
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.folderEditSuccess));
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast.error(intl.formatMessage(translations.folderEditFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  if (!isOpen) {
    return null;
  }

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
          {intl.formatMessage(translations.editSubfolderTitle)}
        </DialogTitle>
        <DialogContent>
          <FolderForm
            editing
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

export default injectIntl(FolderEdit);
