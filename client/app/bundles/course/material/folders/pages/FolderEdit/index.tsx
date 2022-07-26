import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch } from 'types/store';
import { FolderFormData } from 'types/course/material/folders';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

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
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (data: FolderFormData, setError): void => {
    dispatch(updateFolder(data, folderId))
      .then((_) => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.folderEditSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.folderEditFailure));

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

  if (!isOpen) {
    return null;
  }

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
