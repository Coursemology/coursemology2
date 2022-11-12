import { FC, useState } from 'react';
import Dropzone from 'react-dropzone';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { FileUpload as FileUploadIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';

interface Props extends WrappedComponentProps {
  uploadedFiles: File[];
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
  const { intl, uploadedFiles, setUploadedFiles, disabled } = props;

  const [dropZoneActive, setDropZoneActive] = useState(false);

  const displayFileNames = (files: File[]): JSX.Element | JSX.Element[] => {
    if (dropZoneActive) return <FileUploadIcon className="h-20 w-20" />;

    if (files.length === 0)
      return (
        <p className="m-0 whitespace-normal break-all">
          {intl.formatMessage(translations.uploadLabel)}
        </p>
      );

    return files.map((file) => (
      <Chip
        key={file.name}
        className="m-2"
        label={file.name}
        onDelete={(): void =>
          setUploadedFiles(
            uploadedFiles.filter(
              (uploadedFile) => uploadedFile.name !== file.name,
            ),
          )
        }
      />
    ));
  };

  return (
    <Dropzone
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

          if (!isValidName)
            toast.error(
              `${file.name} ${intl.formatMessage(
                translations.sameFileNameError,
              )}`,
            );

          return isValidName;
        });

        setUploadedFiles([...uploadedFiles, ...files]);
        setDropZoneActive(false);
      }}
    >
      {({ getRootProps, getInputProps }): JSX.Element => (
        <div
          {...getRootProps({
            className:
              'my-8 flex min-h-[12rem] w-full flex-wrap items-center justify-center rounded-lg border-2 border-dashed border-neutral-400 p-4 text-center select-none cursor-pointer',
          })}
        >
          <input {...getInputProps()} />
          {displayFileNames(uploadedFiles)}
        </div>
      )}
    </Dropzone>
  );
};

export default injectIntl(MultipleFileInput);
