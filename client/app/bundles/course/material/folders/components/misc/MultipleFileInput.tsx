import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import Dropzone from 'react-dropzone';

import { FileUpload as FileUploadIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { grey } from '@mui/material/colors';
import { toast } from 'react-toastify';

interface Props extends WrappedComponentProps {
  uploadedFiles: File[];
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  disabled: boolean;
}

const translations = defineMessages({
  uploadLabel: {
    id: 'course.materials.folders.uploadForm.uploadLabel',
    defaultMessage: 'Drag and drop or click to upload files',
  },
  sameFileNameError: {
    id: 'course.materials.folders.uploadForm.sameFileNameError',
    defaultMessage:
      ' could not be uploaded as another file already has that name',
  },
});

const MultipleFileInput: FC<Props> = (props) => {
  const { intl, uploadedFiles, setIsDirty, setUploadedFiles, disabled } = props;

  const [dropZoneActive, setDropZoneActive] = useState(false);

  const displayFileNames = (files: File[]): JSX.Element => {
    if (dropZoneActive) {
      return <FileUploadIcon style={{ width: 60, height: 60 }} />;
    }
    if (files.length === 0) {
      return (
        <p
          style={{
            marginBottom: 0,
            wordBreak: 'break-all',
            whiteSpace: 'normal',
          }}
        >
          {intl.formatMessage(translations.uploadLabel)}
        </p>
      );
    }
    return (
      <>
        {files.map((file) => {
          return (
            <Chip key={file.name} label={file.name} style={{ margin: 4 }} />
          );
        })}
      </>
    );
  };

  return (
    <Dropzone
      id="material-upload"
      disabled={disabled}
      onDragEnter={(): void => setDropZoneActive(true)}
      onDragLeave={(): void => setDropZoneActive(false)}
      onDrop={(files): void => {
        /*
          Error checking (if any filenames are the same)
          Logic: For every file in files, remove it and show an error
          if it has the same name as a file in uploadedFiles
          */
        files = files.filter((file): boolean => {
          const isValidName = uploadedFiles.every(
            (uploadedFile): boolean => uploadedFile.name !== file.name,
          );
          if (!isValidName) {
            toast.error(
              `${file.name} ${intl.formatMessage(
                translations.sameFileNameError,
              )}`,
            );
          }
          return isValidName;
        });

        setUploadedFiles(uploadedFiles.concat(files));
        setDropZoneActive(false);
        setIsDirty(true);
      }}
      style={{
        width: '100%',
        borderWidth: 2,
        borderColor: grey[500],
        borderStyle: 'dashed',
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          minHeight: 100,
          margin: 10,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {displayFileNames(uploadedFiles)}
      </div>
    </Dropzone>
  );
};

export default injectIntl(MultipleFileInput);
