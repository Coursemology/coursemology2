import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { toast } from 'react-toastify';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import MaterialUploadForm from '../forms/MaterialUploadForm';
import { uploadMaterials } from '../../operations';

interface Props extends WrappedComponentProps {
  isOpen: boolean;
  handleClose: () => void;
  currFolderId: number;
}

const translations = defineMessages({
  uploadMaterialsTitle: {
    id: 'course.materials.folders.uploadMaterialsTitle',
    defaultMessage: 'Upload Files',
  },
  materialUploadSuccess: {
    id: 'course.materials.folders.materialUploadSuccess',
    defaultMessage: 'Files have been uploaded',
  },
  materialUploadFailure: {
    id: 'course.materials.folders.materialUploadFailure',
    defaultMessage: 'Files upload failed',
  },
});

const MaterialUpload: FC<Props> = (props) => {
  const { intl, isOpen, handleClose, currFolderId } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (): void => {
    setIsSubmitting(true);

    dispatch(uploadMaterials({ files: uploadedFiles }, currFolderId))
      .then((_) => {
        handleClose();
        setConfirmationDialogOpen(false);
        setUploadedFiles([]);
        toast.success(intl.formatMessage(translations.materialUploadSuccess));
      })
      .catch((error) => {
        toast.error(
          `${intl.formatMessage(
            translations.materialUploadFailure,
          )} - ${error}`,
        );
        throw error;
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Dialog
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            setUploadedFiles([]);
            handleClose();
          }
        }}
        open={isOpen}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {intl.formatMessage(translations.uploadMaterialsTitle)}
        </DialogTitle>
        <DialogContent>
          <MaterialUploadForm
            handleClose={(): void => {
              if (isDirty) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            setIsDirty={setIsDirty}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
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
          setUploadedFiles([]);
          setIsDirty(false);
        }}
      />
    </>
  );
};

export default injectIntl(MaterialUpload);
