import { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import FileUpload from '@mui/icons-material/FileUpload';
import { Card, CardContent, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const translations = defineMessages({
  uploadDisabled: {
    id: 'course.assessment.submission.FileInput.uploadDisabled',
    defaultMessage: 'File upload disabled',
  },
  uploadLabel: {
    id: 'course.assessment.submission.FileInput.uploadLabel',
    defaultMessage: 'Drag and drop or click to upload files',
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
    } = this.props;

    return (
      <div>
        <Dropzone
          disabled={disabled}
          onDragEnter={() => this.onDragEnter()}
          onDragLeave={() => this.onDragLeave()}
          onDrop={(files) => this.onDrop(files)}
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
        {error || ''}
      </div>
    );
  }
}

FileInput.propTypes = {
  disabled: PropTypes.bool,
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
  const { disabled, name, onChangeCallback, onDropCallback } = props;
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
          onDropCallback={onDropCallback}
        />
      )}
    />
  );
};

FileInputField.propTypes = {
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChangeCallback: PropTypes.func,
  onDropCallback: PropTypes.func,
};

export default FileInputField;
