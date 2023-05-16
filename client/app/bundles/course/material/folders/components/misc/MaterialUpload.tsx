import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { useAppDispatch } from 'lib/hooks/store';

import { uploadMaterials } from '../../operations';
import MaterialUploadForm from '../forms/MaterialUploadForm';

interface Props extends WrappedComponentProps {
  isOpen: boolean;
  handleClose: () => void;
  currFolderId: number;
}

const translations = defineMessages({
  uploadMaterialsTitle: {
    id: 'course.material.folders.MaterialUpload.uploadMaterialsTitle',
    defaultMessage: 'Upload Files',
  },
  materialUploadSuccess: {
    id: 'course.material.folders.MaterialUpload.materialUploadSuccess',
    defaultMessage: 'Files have been uploaded',
  },
  materialUploadFailure: {
    id: 'course.material.folders.MaterialUpload.materialUploadFailure',
    defaultMessage: 'Files upload failed',
  },
});

const MaterialUpload: FC<Props> = (props) => {
  const { intl, isOpen, handleClose, currFolderId } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const dispatch = useAppDispatch();

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
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          `${intl.formatMessage(
            translations.materialUploadFailure,
          )} - ${errorMessage}`,
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={(): void => {
          if (uploadedFiles.length > 0) {
            setConfirmationDialogOpen(true);
          } else {
            setUploadedFiles([]);
            handleClose();
          }
        }}
        open={isOpen}
      >
        <DialogTitle>
          {intl.formatMessage(translations.uploadMaterialsTitle)}
        </DialogTitle>
        <DialogContent>
          <MaterialUploadForm
            handleClose={(): void => {
              if (uploadedFiles.length > 0) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            setUploadedFiles={setUploadedFiles}
            uploadedFiles={uploadedFiles}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
          handleClose();
          setUploadedFiles([]);
        }}
        open={confirmationDialogOpen}
      />
    </>
  );
};

export default injectIntl(MaterialUpload);
