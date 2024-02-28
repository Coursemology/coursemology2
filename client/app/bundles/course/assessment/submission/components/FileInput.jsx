import { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import FileUpload from '@mui/icons-material/FileUpload';
import { Card, CardContent, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { AttachmentType } from 'types/course/assessment/question/text-responses';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';

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
  fileUploadErrorMessage: {
    id: 'course.assessment.submission.FileInput.fileUploadErrorMessage',
    defaultMessage:
      'You attempted to upload {numFiles} files, but only one file can be uploaded for this question',
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

class FileInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropzoneActive: false,
      numFilesRejected: 0,
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
    const { isMultipleUploadAllowed } = this.props;
    if (!isMultipleUploadAllowed && filesRejected.length > 1) {
      this.setState({
        numFilesRejected: filesRejected.length,
      });
    }
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
      isMultipleUploadAllowed,
    } = this.props;
    const { numFilesRejected } = this.state;

    return (
      <div>
        <Dropzone
          disabled={disabled}
          multiple={isMultipleUploadAllowed}
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
          onClose={() => this.setState({ numFilesRejected: 0 })}
          open={numFilesRejected > 0}
          title={<FormattedMessage {...translations.fileUploadErrorTitle} />}
        >
          <PromptText>
            <FormattedMessage
              {...translations.fileUploadErrorMessage}
              values={{ numFiles: numFilesRejected }}
            />
          </PromptText>
        </Prompt>

        {error || ''}
      </div>
    );
  }
}

FileInput.propTypes = {
  disabled: PropTypes.bool,
  isMultipleUploadAllowed: PropTypes.bool,
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
    attachmentExists,
    attachmentType,
    disabled,
    isProgrammingQuestion,
    name,
    onChangeCallback,
    onDropCallback,
  } = props;
  const { control } = useFormContext();
  const isMultipleUploadAllowed =
    isProgrammingQuestion ||
    attachmentType === AttachmentType.MULTIPLE_FILE_ATTACHMENT;
  const isFileUploadStillAllowed =
    attachmentType === AttachmentType.MULTIPLE_FILE_ATTACHMENT ||
    !attachmentExists;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FileInput
          disabled={disabled || !isFileUploadStillAllowed}
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
          isMultipleUploadAllowed={isMultipleUploadAllowed}
          onDropCallback={onDropCallback}
        />
      )}
    />
  );
};

FileInputField.propTypes = {
  attachmentExists: PropTypes.bool,
  attachmentType: PropTypes.oneOf(Object.values(AttachmentType)),
  name: PropTypes.string.isRequired,
  isProgrammingQuestion: PropTypes.bool,
  disabled: PropTypes.bool.isRequired,
  onChangeCallback: PropTypes.func,
  onDropCallback: PropTypes.func,
};

export default FileInputField;
