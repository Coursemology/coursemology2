import { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { grey, red } from '@mui/material/colors';
import FilePreview from './FilePreview';
import ImagePreview from './ImagePreview';
import BadgePreview from './BadgePreview';

const styles = {
  dropzone: {
    backgroundColor: grey[300],
    borderRadius: 5,
    padding: 20,
    textAlign: 'center',
    width: '100%',
  },
  fileLabelError: {
    color: red[500],
    display: 'inline-block',
  },
};

/**
 * Creates a Single file input component for use with Redux Forms.
 * The display of the file can be customized by passing a component or function as the `previewComponent` prop.
 * The PreviewComponent may accept the following props:
 *   - file: the selected file
 *   - originalName: the name of the last uploaded file
 *   - originalUrl: the URL of the last uploaded file
 *   - handleCancel: event handler to clear the input
 *
 * Additional format of form props (see createComponent for base set):
 * {
 *   ...createComponent,
 *   value: {
 *      url, // URL of preview of existing file if it is an image, otherwise nil.
 *     name, // Name of existing file, if any.
 *   },
 * }
 */
// TODO: Use the input element as a controller component - https://reactjs.org/docs/forms.html
class FormSingleFileInput extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
    this.updateStore(undefined);
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

  renderErrorMessage = () => {
    const {
      fieldState: { isTouched, error },
    } = this.props;
    return isTouched && error ? (
      <div className="error-message" style={styles.fileLabelError}>
        {error.message}
      </div>
    ) : null;
  };

  render() {
    const { accept, disabled, previewComponent: PreviewComponent } = this.props;
    const {
      field: {
        value: { name, url },
      },
    } = this.props;

    return (
      <Dropzone
        accept={accept}
        disabled={disabled}
        multiple={false}
        onDrop={this.onDrop}
        style={styles.dropzone}
      >
        <div>
          <PreviewComponent
            file={this.state.file}
            originalName={name}
            originalUrl={url}
            handleCancel={this.onCancel}
          />
        </div>
        {this.renderErrorMessage()}
      </Dropzone>
    );
  }
}

FormSingleFileInput.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  accept: PropTypes.string,
  disabled: PropTypes.bool,
  previewComponent: PropTypes.func,
};

FormSingleFileInput.defaultProps = {
  previewComponent: FilePreview,
};

export default FormSingleFileInput;

export { FilePreview, ImagePreview, BadgePreview };
