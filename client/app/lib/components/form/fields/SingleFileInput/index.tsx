import { ComponentType, UIEvent, useEffect, useRef, useState } from 'react';
import Dropzone, { Accept, FileRejection } from 'react-dropzone';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { InputLabel } from '@mui/material';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';

import BadgePreview from './BadgePreview';
import FilePreview from './FilePreview';
import ImagePreview from './ImagePreview';

interface SingleFileInputProps<
  T extends FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
> {
  className?: string;
  field: ControllerRenderProps<T, TName>;
  fieldState: ControllerFieldState;
  accept?: Accept;
  // In bytes. A larger file is rejected, and reported through `onDropRejected`.
  maxSize?: number;
  onDropRejected?: (rejections: FileRejection[]) => void;
  disabled?: boolean;
  previewComponent?: ComponentType<PreviewComponentProps>;
  label?: string;
}

export interface PreviewComponentProps {
  file: File | null;
  originalName?: string;
  originalUrl?: string;
  handleCancel: (e: UIEvent) => void;
}

/**
 * Creates a Single file input component for use with react hook form.
 * The display of the file can be customized by passing a component or function as the `previewComponent` prop.
 * The PreviewComponent may accept the following props:
 *   - file: the selected file
 *   - originalName: the name of the last uploaded file
 *   - originalUrl: the URL of the last uploaded file
 *   - handleCancel: event handler to clear the input
 */
const FormSingleFileInput = <
  T extends FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
>(
  props: SingleFileInputProps<T, TName>,
): JSX.Element => {
  const {
    className,
    field: { value, onChange },
    fieldState: { error },
    accept,
    maxSize,
    onDropRejected,
    disabled,
    previewComponent: PreviewComponent = FilePreview,
    label,
  } = props;

  const {
    name,
    url,
    file: fieldFile,
  } = value as {
    name: string;
    url: string;
    file?: File | null;
  };
  const [file, setFile] = useState<File | null>(
    fieldFile instanceof File ? fieldFile : null,
  );
  const mounted = useRef(false);

  const onCancel = (e: UIEvent): void => {
    setFile(null);
    e.stopPropagation();
  };

  const onDrop = (files: File[]): void => {
    // Dropzone calls this even when it rejected every file; keep the current file rather than clearing it.
    if (files.length === 0) return;
    setFile(files[0]);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onChange({ file, url, name });
  }, [file]);

  return (
    <>
      {label && <InputLabel disabled={disabled}>{label}</InputLabel>}
      <Dropzone
        accept={accept}
        disabled={disabled}
        maxSize={maxSize}
        multiple={false}
        onDrop={onDrop}
        onDropRejected={onDropRejected}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: `
              dropzone-input select-none cursor-pointer
              flex h-100 p-10 items-center justify-center text-center
              shadow-md rounded-md ${className ?? ''}
            `,
            })}
          >
            <input {...getInputProps()} />

            <PreviewComponent
              file={file}
              handleCancel={onCancel}
              originalName={name}
              originalUrl={url}
            />

            {error && (
              <div className="error-message text-red-500 inline-block">
                {formatErrorMessage(error.message)}
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </>
  );
};

export default FormSingleFileInput;

export { BadgePreview, FilePreview, ImagePreview };
