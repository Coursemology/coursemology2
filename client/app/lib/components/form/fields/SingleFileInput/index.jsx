import { Component } from 'react';
import Dropzone from 'react-dropzone';
import { InputLabel } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';

import BadgePreview from './BadgePreview';
import FilePreview from './FilePreview';
import ImagePreview from './ImagePreview';

const styles = {
  fileLabelError: {
    color: red[500],
    display: 'inline-block',
  },
};

/**
 * Creates a Single file input component for use with react hook form.
 * The display of the file can be customized by passing a component or function as the `previewComponent` prop.
 * The PreviewComponent may accept the following props:
 *   - file: the selected file
 *   - originalName: the name of the last uploaded file
 *   - originalUrl: the URL of the last uploaded file
 *   - handleCancel: event handler to clear the input
 *
 */
// TODO: Use the input element as a controller component - https://reactjs.org/docs/forms.html
class FormSingleFileInput extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
  }

  onCancel = (e) => {
    this.setState({ file: null }, this.updateStore(undefined));
    e.stopPropagation();
  };

  onDrop = (files) => {
    this.setState({ file: files[0] }, this.updateStore(files[0]));
  };

  updateStore = (file) => {
    const {
      field: {
        onChange,
        value: { url, name },
      },
    } = this.props;
    onChange({ file, url, name });
  };

  render() {
    const {
      accept,
      disabled,
      previewComponent: PreviewComponent,
      label,
    } = this.props;
    const {
      field: {
        value: { name, url },
      },
      fieldState: { error },
    } = this.props;

    return (
      <>
        {label && <InputLabel disabled={disabled}>{label}</InputLabel>}
        <Dropzone
          accept={accept}
          disabled={disabled}
          multiple={false}
          onDrop={this.onDrop}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps({
                className: `
                dropzone-input select-none cursor-pointer
                flex h-100 p-10 items-center justify-center text-center
                shadow-md rounded-md
              `,
              })}
            >
              <input {...getInputProps()} />

              <PreviewComponent
                file={this.state.file}
                handleCancel={this.onCancel}
                originalName={name}
                originalUrl={url}
              />

              {error && (
                <div className="error-message" style={styles.fileLabelError}>
                  {formatErrorMessage(error.message)}
                </div>
              )}
            </div>
          )}
        </Dropzone>
      </>
    );
  }
}

FormSingleFileInput.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  accept: PropTypes.object,
  disabled: PropTypes.bool,
  previewComponent: PropTypes.func,
  label: PropTypes.string,
};

FormSingleFileInput.defaultProps = {
  previewComponent: FilePreview,
};

export default FormSingleFileInput;

export { BadgePreview, FilePreview, ImagePreview };
