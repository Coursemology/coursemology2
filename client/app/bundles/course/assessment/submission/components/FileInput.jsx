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
      callback,
      disabled,
      field: { onChange },
    } = this.props;
    this.setState({ dropzoneActive: false });
    if (!disabled) {
      callback(files);
      return onChange(files.length > 0 ? files : null);
    }
    return () => {};
  }

  displayFileNames(files) {
    const {
      disabled,
      field: { onChange },
    } = this.props;
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
            label={f.name}
            onDelete={() => {
              const updatedFiles = files.filter((file) => file.name !== f.name);
              return onChange(updatedFiles);
            }}
            style={styles.chip}
          />
        ))}
      </div>
    );
  }

  render() {
    const {
      name,
      className,
      inputOptions,
      disabled,
      fieldState: { error },
      field: { value },
    } = this.props;

    return (
      <div className={className}>
        <Dropzone
          {...inputOptions}
          disabled={disabled}
          onDragEnter={() => this.onDragEnter()}
          onDragLeave={() => this.onDragLeave()}
          onDrop={(files) => this.onDrop(files)}
        >
          {({ getRootProps, getInputProps }) => (
            <Card
              {...getRootProps({
                className: 'dropzone-input select-none cursor-pointer',
                style: styles.paper,
              })}
            >
              <input {...getInputProps({ name })} />
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
  name: PropTypes.string,
  className: PropTypes.string,
  inputOptions: PropTypes.shape({
    multiple: PropTypes.bool,
    accept: PropTypes.string,
  }),
  disabled: PropTypes.bool,
  fieldState: PropTypes.shape({
    error: PropTypes.bool,
  }).isRequired,
  field: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }).isRequired,
  callback: PropTypes.func,
};

FileInput.defaultProps = {
  className: '',
  disabled: false,
  callback: () => {},
};

const FileInputField = ({
  name,
  disabled,
  callback,
  saveAnswer,
  answerId,
  ...custom
}) => {
  const { control, getValues } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FileInput
          callback={callback}
          disabled={disabled}
          field={{
            ...field,
            onChange: (event) => {
              field.onChange(event);
              if (saveAnswer) {
                const modifiedAnswer = {
                  [answerId]: getValues()[answerId],
                };
                saveAnswer(modifiedAnswer, answerId);
              }
            },
          }}
          fieldState={fieldState}
          {...custom}
        />
      )}
    />
  );
};

FileInputField.propTypes = {
  name: PropTypes.string,
  disabled: PropTypes.bool,
  callback: PropTypes.func,
  answerId: PropTypes.number,
  saveAnswer: PropTypes.func,
};

export default FileInputField;
