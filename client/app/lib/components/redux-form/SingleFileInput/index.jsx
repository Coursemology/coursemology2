import { Component } from 'react';
import PropTypes from 'prop-types';
import { fieldMetaPropTypes } from 'redux-form';
import { FormattedMessage, intlShape } from 'react-intl';
import Dropzone from 'react-dropzone';
import { grey300, red500 } from 'material-ui/styles/colors';
import createComponent from '../createComponent';
import mapError from '../mapError';
import FilePreview from './FilePreview';
import ImagePreview from './ImagePreview';
import BadgePreview from './BadgePreview';

const styles = {
  dropzone: {
    backgroundColor: grey300,
    borderRadius: 5,
    padding: 20,
    textAlign: 'center',
    width: '100%',
  },
  fileLabelError: {
    color: red500,
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
class SingleFileInput extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
    this.updateStore(undefined);
  }

  onCancel = (e) => {
    this.setState({ file: null }, this.updateStore(''));
    e.stopPropagation();
  };

  onDrop = (files) => {
    this.setState({ file: files[0] }, this.updateStore(files[0]));
  };

  updateStore = (file) => {
    // eslint-disable-line react/sort-comp
    const {
      input: { onChange },
      value: { url, name },
    } = this.props;
    onChange({ file, url, name });
  };

  renderErrorMessage = () => {
    const {
      meta: { touched, error },
    } = this.props;
    return touched && error ? (
      <div className="error-message" style={styles.fileLabelError}>
        <FormattedMessage {...error} />
      </div>
    ) : null;
  };

  render() {
    const { accept, previewComponent: PreviewComponent } = this.props;
    const {
      value: { name, url },
    } = this.props;

    return (
      <Dropzone
        multiple={false}
        onDrop={this.onDrop}
        style={styles.dropzone}
        accept={accept}
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

SingleFileInput.propTypes = {
  meta: PropTypes.shape(fieldMetaPropTypes),
  value: PropTypes.shape({
    file: PropTypes.object,
    url: PropTypes.string,
    name: PropTypes.string,
  }),
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
  }),
  errorMessage: PropTypes.string,
  required: PropTypes.bool,
  intl: intlShape.isRequired,
  accept: PropTypes.string,
  previewComponent: PropTypes.func,
};

SingleFileInput.defaultProps = {
  previewComponent: FilePreview,
};

const mapProps = ({ ...props }) => ({
  ...props,
  ...mapError(props),
});

export default createComponent(SingleFileInput, mapProps);

export { FilePreview, ImagePreview, BadgePreview };
