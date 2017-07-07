import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Field } from 'redux-form';
import Chip from 'material-ui/Chip';
import { Card, CardText } from 'material-ui/Card';
import FileUploadIcon from 'material-ui/svg-icons/file/file-upload';
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  uploadDisabled: {
    id: 'course.assessment.submission.UploadedFileView.uploadDisabled',
    defaultMessage: 'File upload disabled',
  },
  uploadLabel: {
    id: 'course.assessment.submission.UploadedFileView.uploadLabel',
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
  static propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    inputOptions: PropTypes.shape({
      multiple: PropTypes.bool,
      accept: PropTypes.string,
    }),
    disabled: PropTypes.bool,
    meta: PropTypes.shape({
      error: PropTypes.bool,
      touched: PropTypes.bool,
    }).isRequired,
    input: PropTypes.shape({
      onChange: PropTypes.func,
    }).isRequired,
    callback: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    disabled: false,
    callback: () => {},
  };

  state = {
    dropzoneActive: false,
  };

  onDragEnter() {
    this.setState({ dropzoneActive: true });
  }

  onDragLeave() {
    this.setState({ dropzoneActive: false });
  }

  onDrop(files) {
    const { callback, disabled, input: { onChange } } = this.props;
    this.setState({ dropzoneActive: false });
    if (!disabled) {
      callback(files);
      return onChange(files);
    }
    return () => {};
  }

  displayFileNames(files) {
    const { disabled } = this.props;
    const { dropzoneActive } = this.state;
    if (dropzoneActive) {
      return <FileUploadIcon style={{ width: 60, height: 60 }} />;
    }

    if (!files || !files.length) {
      return (
        <h4>
          {disabled ?
            <FormattedMessage {...translations.uploadDisabled} /> :
            <FormattedMessage {...translations.uploadLabel} />
          }
        </h4>
      );
    }
    return (<div>
      <div style={styles.wrapper}>
        {files.map(f => (<Chip style={styles.chip} key={f.name}>{f.name}</Chip>))}
      </div>
    </div>);
  }

  render() {
    const {
      name, className, inputOptions, disabled, meta: { error, touched },
      input: { value },
    } = this.props;

    return (
      <div className={className}>
        <Dropzone
          {...inputOptions}
          disableClick={disabled}
          onDragEnter={() => this.onDragEnter()}
          onDragLeave={() => this.onDragLeave()}
          onDrop={files => this.onDrop(files)}
          className="dropzone-input"
          name={name}
        >
          <Card style={styles.paper}>
            <CardText>{this.displayFileNames(value)}</CardText>
          </Card>
        </Dropzone>
        {error && touched ? error : ''}
      </div>
    );
  }
}
export default props => <Field {...props} component={FileInput} />;
