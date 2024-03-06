import { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import FileUpload from '@mui/icons-material/FileUpload';
import { Card, CardContent, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import formTranslations from 'lib/translations/form';

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
      'You have attempted to upload {numFiles} files, but only 1 file can be uploaded',
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
    const { isMultipleAttachmentsAllowed } = this.props;
    if (!isMultipleAttachmentsAllowed && filesRejected.length > 1) {
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
      isMultipleAttachmentsAllowed,
    } = this.props;
    const { numFilesRejected } = this.state;

    return (
      <div>
        <Dropzone
          disabled={disabled}
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
  isMultipleAttachmentsAllowed: PropTypes.bool,
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
    name,
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
          onDropCallback={onDropCallback}
        />
      )}
    />
  );
};

FileInputField.propTypes = {
  name: PropTypes.string.isRequired,
  isMultipleAttachmentsAllowed: PropTypes.bool,
  disabled: PropTypes.bool.isRequired,
  onChangeCallback: PropTypes.func,
  onDropCallback: PropTypes.func,
};

export default FileInputField;
