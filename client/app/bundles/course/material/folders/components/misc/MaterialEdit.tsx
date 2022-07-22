import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch } from 'types/store';
import { MaterialFormData } from 'types/course/material/folders';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import { updateMaterial } from '../../operations';
import MaterialForm from '../forms/MaterialForm';

interface Props extends WrappedComponentProps {
  isOpen: boolean;
  handleClose: () => void;
  folderId: number;
  materialId: number;
  initialValues: {
    name: string;
    description: string | null;
    file: { name: string; url: string };
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
    id: 'course.materials.folders.folderEditSuccess',
    defaultMessage: 'Folder could not be edited',
  },
});

const FolderEdit: FC<Props> = (props) => {
  const { intl, isOpen, handleClose, folderId, materialId, initialValues } =
    props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (data: MaterialFormData, setError): void => {
    dispatch(updateMaterial(data, folderId, materialId))
      .then((_) => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.folderEditSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.folderEditFailure));
        if (error.response?.data) {
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
          <MaterialForm
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
