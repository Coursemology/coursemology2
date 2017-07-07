import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Field } from 'redux-form';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';
import { Card, CardText } from 'material-ui/Card';
import AddIcon from 'material-ui/svg-icons/content/add';

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
    children: PropTypes.node,
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
    dragging: false,
    dropzoneActive: false,
  };

  displayFileNames(files) {
    const { disabled } = this.props;
    const { dragging, dropzoneActive } = this.state;
    if (dropzoneActive) {
      return <AddIcon style={{ width: 60, height: 60 }} />;
    }

    if (!files || dragging) {
      return (
        <h4>{disabled ? 'File upload disabled' : 'Drag and drop or click to upload files'}</h4>
      );
    }
    return (<div style={styles.wrapper}>
      {files.map(f => (<Chip style={styles.chip} key={f.name}>{f.name}</Chip>))}
    </div>);
  }

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
