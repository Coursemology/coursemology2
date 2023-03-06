import { Dispatch, FC, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import { Button } from '@mui/material';

import formTranslations from 'lib/translations/form';

import MultipleFileInput from '../misc/MultipleFileInput';

interface Props {
  handleClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  uploadedFiles: File[];
  setUploadedFiles: Dispatch<SetStateAction<File[]>>;
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
        key="material-upload-form-cancel-button"
        className="btn-cancel"
        color="secondary"
        disabled={isSubmitting}
        onClick={(): void => handleClose()}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      <LoadingButton
        key="material-upload-form-upload-button"
        className="btn-submit"
        color="primary"
        disabled={isSubmitting || uploadedFiles.length === 0}
        id="material-upload-form-upload-button"
        loading={isSubmitting}
        onClick={(): void => onSubmit()}
        variant="contained"
      >
        <FormattedMessage {...formTranslations.upload} />
      </LoadingButton>
    </div>
  );

  return (
    <>
      <MultipleFileInput
        disabled={isSubmitting}
        setUploadedFiles={setUploadedFiles}
        uploadedFiles={uploadedFiles}
      />
      {actionButtons}
    </>
  );
};

export default MaterialUploadForm;
