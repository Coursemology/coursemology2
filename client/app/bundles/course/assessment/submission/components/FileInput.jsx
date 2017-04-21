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
    callback: () => {},
  };

  render() {
    const {
      name, className, inputOptions, meta: { error, touched },
      children, input: { onChange, value }, callback,
    } = this.props;

    return (
      <div className={className}>
        <Dropzone
          {...inputOptions}
          onDrop={(f) => {
            callback(f[0]);
            return onChange(f[0]);
          }}
          className="dropzone-input"
          name={name}
        >
          {children}
          {value.name || 'No file chosen'}
        </Dropzone>
        {error && touched ? error : ''}
      </div>
    );
  }
}
export default props => <Field {...props} component={FileInput} />;
