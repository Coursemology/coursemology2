import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import { Field } from 'redux-form';

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

  generateFilename(name) {
    const { disabled } = this.props;
    if (!name) {
      return disabled ? 'File upload disabled' : 'No file chosen';
    }
    return name;
  }

  render() {
    const {
      name, className, inputOptions, disabled, meta: { error, touched },
      children, input: { onChange, value }, callback,
    } = this.props;

    return (
      <div className={className}>
        <Dropzone
          {...inputOptions}
          disableClick={disabled}
          onDrop={(f) => {
            if (!disabled) {
              callback(f[0]);
              return onChange(f[0]);
            }
            return () => {};
          }}
          className="dropzone-input"
          name={name}
        >
          {children}
          {this.generateFilename(value.name)}
        </Dropzone>
        {error && touched ? error : ''}
      </div>
    );
  }
}
export default props => <Field {...props} component={FileInput} />;
