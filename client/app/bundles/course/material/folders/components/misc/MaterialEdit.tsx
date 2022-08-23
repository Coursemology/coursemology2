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
  editMaterialTitle: {
    id: 'course.materials.folders.editMaterialTitle',
    defaultMessage: 'Edit Material',
  },
  materialEditSuccess: {
    id: 'course.materials.folders.materialEditSuccess',
    defaultMessage: 'File has been edited',
  },
  materialEditFailure: {
    id: 'course.materials.folders.materialEditFailure',
    defaultMessage: 'File could not be edited',
  },
});

const FolderEdit: FC<Props> = (props) => {
  const { intl, isOpen, handleClose, folderId, materialId, initialValues } =
    props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (data: MaterialFormData, setError): void => {
    setIsSubmitting(true);

    dispatch(updateMaterial(data, folderId, materialId))
      .then((_) => {
        setIsSubmitting(false);
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.materialEditSuccess));
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast.error(intl.formatMessage(translations.materialEditFailure));
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
          {intl.formatMessage(translations.editMaterialTitle)}
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
