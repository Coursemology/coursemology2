import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import formTranslations from 'lib/translations/form';

import MultipleFileInput from '../misc/MultipleFileInput';

interface Props {
  handleClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const MaterialUploadForm: FC<Props> = (props) => {
  const {
    handleClose,
    onSubmit,
    isSubmitting,
    uploadedFiles,
    setUploadedFiles,
  } = props;

  const actionButtons = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '20px',
      }}
    >
      <Button
        color="primary"
        className="btn-cancel"
        disabled={isSubmitting}
        key="material-upload-form-cancel-button"
        onClick={(): void => handleClose()}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      <LoadingButton
        id="material-upload-form-upload-button"
        variant="contained"
        color="primary"
        className="btn-submit"
        disabled={isSubmitting || uploadedFiles.length === 0}
        key="material-upload-form-upload-button"
        onClick={(): void => onSubmit()}
        loading={isSubmitting}
      >
        <FormattedMessage {...formTranslations.upload} />
      </LoadingButton>
    </div>
  );

  return (
    <>
      <MultipleFileInput
        disabled={isSubmitting}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
      />
      {actionButtons}
    </>
  );
};

export default MaterialUploadForm;
