import { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import FileUpload from '@mui/icons-material/FileUpload';
import { Card, CardContent, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import Prompt from 'lib/components/core/dialogs/Prompt';
import formTranslations from 'lib/translations/form';

import { MEGABYTES_TO_BYTES } from '../constants';

import {
  ErrorCodes,
  FileTooLargeErrorPromptContent,
  TooManyFilesErrorPromptContent,
} from './DropzoneErrorComponent';

const translations = defineMessages({
  uploadDisabled: {
    id: 'course.assessment.submission.FileInput.uploadDisabled',
    defaultMessage: 'File upload disabled',
  },
  uploadLabel: {
    id: 'course.assessment.submission.FileInput.uploadLabel',
    defaultMessage: 'Drag and drop or click to upload files',
  },
  fileUploadErrorTitle: {
    id: 'course.assessment.submission.FileInput.fileUploadErrorTitle',
    defaultMessage: 'Error in Uploading Files',
  },
});

const styles = {
  chip: {
    margin: 4,
  },
  paper: {
    display: 'flex',
    height: 100,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const isFileTooLarge = (file) =>
  file.errors.some((error) => error.code === ErrorCodes.FileTooLarge);

const initialErrorState = {
  [ErrorCodes.FileTooLarge]: [],
  [ErrorCodes.TooManyFiles]: 0,
};

class FileInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropzoneActive: false,
      errors: initialErrorState,
    };
  }

  onDragEnter() {
    this.setState({ dropzoneActive: true });
  }

  onDragLeave() {
    this.setState({ dropzoneActive: false });
  }

  onDrop(files) {
    const {
      onDropCallback,
      disabled,
      field: { onChange },
    } = this.props;
    this.setState({ dropzoneActive: false });
    if (!disabled) {
      onDropCallback(files);
      return onChange(files.length > 0 ? files : null);
    }
    return () => {};
  }

  onDropRejected(filesRejected) {
    const { maxAttachmentsAllowed } = this.props;
    const tooLargeFiles = filesRejected
      .filter((file) => isFileTooLarge(file))
      .map((file) => file.file.name);
    this.setState({
      errors: {
        [ErrorCodes.FileTooLarge]: tooLargeFiles,
        [ErrorCodes.TooManyFiles]:
          filesRejected.length > maxAttachmentsAllowed
            ? filesRejected.length
            : 0,
      },
    });
  }

  errorExists() {
    const { errors } = this.state;
    return (
      errors[ErrorCodes.FileTooLarge].length > 0 ||
      errors[ErrorCodes.TooManyFiles] > 0
    );
  }

  displayFileNames(files) {
    const { disabled } = this.props;
    const { dropzoneActive } = this.state;
    if (dropzoneActive) {
      return <FileUpload style={{ width: 60, height: 60 }} />;
    }

    if (!files || !files.length) {
      return (
        <Typography>
          {disabled ? (
            <FormattedMessage {...translations.uploadDisabled} />
          ) : (
            <FormattedMessage {...translations.uploadLabel} />
          )}
        </Typography>
      );
    }
    return (
      <div style={styles.wrapper}>
        {files.map((f) => (
          <Chip
            key={f.name}
            disabled={disabled}
            label={f.name}
            style={styles.chip}
          />
        ))}
      </div>
    );
  }

  render() {
    const {
      disabled,
      fieldState: { error },
      field: { value },
      isMultipleAttachmentsAllowed,
      maxAttachmentsAllowed,
      maxAttachmentSize,
      numAttachments,
    } = this.props;
    const { errors } = this.state;

    return (
      <div>
        <Dropzone
          disabled={disabled}
          // 0 means no limit to the maxFiles
          // ref: https://github.com/react-dropzone/react-dropzone/blob/master/examples/maxFiles/README.md
          maxFiles={maxAttachmentsAllowed ?? 0}
          maxSize={maxAttachmentSize * MEGABYTES_TO_BYTES}
          multiple={isMultipleAttachmentsAllowed}
          onDragEnter={() => this.onDragEnter()}
          onDragLeave={() => this.onDragLeave()}
          onDrop={(files) => this.onDrop(files)}
          onDropRejected={(filesRejected) => this.onDropRejected(filesRejected)}
        >
          {({ getRootProps, getInputProps }) => (
            <Card
              {...getRootProps({
                className: `dropzone-input select-none ${
                  !disabled && 'cursor-pointer'
                }`,
                style: styles.paper,
              })}
            >
              <input {...getInputProps()} />
              <CardContent>{this.displayFileNames(value)}</CardContent>
            </Card>
          )}
        </Dropzone>
        <Prompt
          cancelLabel={<FormattedMessage {...formTranslations.close} />}
          onClose={() => this.setState({ errors: initialErrorState })}
          open={this.errorExists()}
          title={<FormattedMessage {...translations.fileUploadErrorTitle} />}
        >
          <div className="space-y-4">
            {errors[ErrorCodes.TooManyFiles] > 0 && (
              <TooManyFilesErrorPromptContent
                maxAttachmentsAllowed={maxAttachmentsAllowed}
                numAttachments={numAttachments}
                numFiles={errors[ErrorCodes.TooManyFiles]}
              />
            )}
            {errors[ErrorCodes.FileTooLarge].length > 0 && (
              <FileTooLargeErrorPromptContent
                maxAttachmentSize={maxAttachmentSize}
                tooLargeFiles={errors[ErrorCodes.FileTooLarge]}
              />
            )}
          </div>
        </Prompt>

        {error || ''}
      </div>
    );
  }
}

FileInput.propTypes = {
  disabled: PropTypes.bool,
  isMultipleAttachmentsAllowed: PropTypes.bool,
  maxAttachmentsAllowed: PropTypes.number,
  maxAttachmentSize: PropTypes.number,
  numAttachments: PropTypes.number,
  fieldState: PropTypes.shape({
    error: PropTypes.bool,
  }).isRequired,
  field: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onDropCallback: PropTypes.func,
};

FileInput.defaultProps = {
  disabled: false,
  onDropCallback: () => {},
};

const FileInputField = (props) => {
  const {
    disabled,
    isMultipleAttachmentsAllowed,
    maxAttachmentsAllowed,
    maxAttachmentSize,
    name,
    numAttachments,
    onChangeCallback,
    onDropCallback,
  } = props;
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FileInput
          disabled={disabled}
          field={{
            ...field,
            onChange: (event) => {
              field.onChange(event);
              if (onChangeCallback) {
                onChangeCallback();
              }
            },
          }}
          fieldState={fieldState}
          isMultipleAttachmentsAllowed={isMultipleAttachmentsAllowed}
          maxAttachmentsAllowed={maxAttachmentsAllowed}
          maxAttachmentSize={maxAttachmentSize}
          numAttachments={numAttachments}
          onDropCallback={onDropCallback}
        />
      )}
    />
  );
};

FileInputField.propTypes = {
  name: PropTypes.string.isRequired,
  isMultipleAttachmentsAllowed: PropTypes.bool,
  maxAttachmentsAllowed: PropTypes.number,
  maxAttachmentSize: PropTypes.number,
  numAttachments: PropTypes.number,
  disabled: PropTypes.bool.isRequired,
  onChangeCallback: PropTypes.func,
  onDropCallback: PropTypes.func,
};

export default FileInputField;
