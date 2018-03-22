import React from 'react';
import PropTypes from 'prop-types';
import { fieldMetaPropTypes } from 'redux-form';
import { defineMessages, FormattedMessage, intlShape } from 'react-intl';
import Dropzone from 'react-dropzone';
import Avatar from 'material-ui/Avatar';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import InsertDriveFileIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import { grey300, grey400, grey900, red500 } from 'material-ui/styles/colors';
import createComponent from './createComponent';
import mapError from './mapError';

const styles = {
  avatar: {
    marginBottom: 5,
  },
  badge: {
    height: 120,
    marginBottom: 10,
    marginRight: 16,
    width: 150,
  },
  image: {
    maxWidth: 300,
    maxHeight: 300,
    width: 'auto',
    height: 'auto',
  },
  badgeIconActive: {
    backgroundColor: grey400,
  },
  badgeIconInactive: {
    backgroundColor: grey300,
  },
  dropzone: {
    badge: {
      backgroundColor: grey300,
      borderRadius: 5,
      height: 200,
      paddingTop: 15,
      textAlign: 'center',
      width: '100%',
    },
    file: {
      backgroundColor: grey300,
      borderRadius: 5,
      paddingTop: 15,
      paddingBottom: 15,
      textAlign: 'center',
      width: '100%',
    },
  },
  fileLabelError: {
    color: red500,
    display: 'inline-block',
  },
  fileIcon: {
    width: 100,
    height: 100,
  },
};

const translations = defineMessages({
  dropzone: {
    id: 'components.reduxForm.singleFileInput.dropzone',
    defaultMessage: 'Drag your file here, or click to select file',
  },
  removeFile: {
    id: 'components.reduxForm.singleFileInput.removeFile',
    defaultMessage: 'Remove File',
  },
});

/**
 * Creates a Single file input component for use with Redux Forms.
 * Available in two display modes: circular Avatar/Badge display (default) and non-circular image display.
 * To use non-circular image display, pass in the prop `isNotBadge` with boolean value `true`.
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
class SingleFileInput extends React.Component {
  static propTypes = {
    meta: PropTypes.shape(fieldMetaPropTypes),
    value: PropTypes.shape({
      url: PropTypes.string,
      name: PropTypes.string,
    }),
    input: PropTypes.shape({
      onChange: PropTypes.func.isRequired,
    }),
    isNotBadge: PropTypes.bool, // to signify non-badge display
    errorMessage: PropTypes.string,
    required: PropTypes.bool,
    intl: intlShape.isRequired,
    accept: PropTypes.string,
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = { file: null };
    this.updateStore(undefined);
  }

  onDrop = (files) => {
    this.setState({ file: files[0] }, this.updateStore(files[0]));
  }

  onCancel = () => {
    this.setState({ file: null }, this.updateStore(''));
  }

  updateStore = (file) => { // eslint-disable-line react/sort-comp
    const { input: { onChange }, value: { url, name } } = this.props;
    onChange({ file, url, name });
  }

  badgeContent = () => {
    const { intl } = this.props;
    return (
      <IconButton
        tooltip={intl.formatMessage(translations.removeFile)}
        onClick={this.onCancel}
      >
        <CloseIcon />
      </IconButton>
    );
  }

  getIsChanged = () => (this.state.file !== null);

  getImage = () => {
    const { value: { url } } = this.props;
    const isImage = this.getIsChanged() && this.state.file.type.includes('image/');

    let imageSrc = null;
    if (isImage) {
      imageSrc = this.state.file.preview;
    } else if (url) {
      imageSrc = url;
    }

    return imageSrc;
  }

  getFileName = () => {
    const { value: { name } } = this.props;
    return this.getIsChanged() ? this.state.file.name : name;
  }

  renderErrorMessage = () => {
    const { meta: { touched, error } } = this.props;
    return (touched && error ?
      <div className="error-message" style={styles.fileLabelError}>
        <FormattedMessage {...error} />
      </div>
      : null);
  }

  // This is rendered in the default SingleFileInput display.
  renderAvatar = () => {
    const { value: { url } } = this.props;
    const isImage = this.getIsChanged() && this.state.file.type.includes('image/');

    const avatarProps = { size: 100, style: styles.avatar };
    if (isImage) {
      avatarProps.src = this.state.file.preview;
    } else if (url) {
      avatarProps.src = url;
    } else {
      avatarProps.icon = (<InsertDriveFileIcon />);
    }

    return <Avatar {...avatarProps} />;
  }

  // This is a customized view in replacement of renderAvatar.
  renderImage = () => {
    const fileName = this.getFileName();
    const imageSrc = this.getImage();

    return (
      imageSrc ?
        <img src={imageSrc} style={styles.image} alt={fileName} />
        :
        <div>
          <InsertDriveFileIcon
            style={{
              ...styles.fileIcon,
              color: fileName ? grey900 : grey400,
            }}
          />
        </div>
    );
  }

  renderFile = () => {
    const { isNotBadge } = this.props;
    const isChanged = this.getIsChanged();
    const fileName = this.getFileName();
    const badgeStyle = isNotBadge ? {} : styles.badge;

    return (
      <div>
        <Badge
          badgeContent={isChanged && this.badgeContent()}
          badgeStyle={isChanged ? styles.badgeIconActive : styles.badgeIconInactive}
          style={badgeStyle}
        >
          { isNotBadge ? this.renderImage() : this.renderAvatar() }
          <div className="file-name">
            {fileName}
            {fileName && fileName.length > 0 && <br />}
          </div>
        </Badge>
        <div>
          <FormattedMessage {...translations.dropzone} />
        </div>
        { this.renderErrorMessage() }
      </div>
    );
  }

  render() {
    const { children, accept, isNotBadge } = this.props;
    const dropzoneStyle = isNotBadge ? styles.dropzone.file : styles.dropzone.badge;
    return (
      <Dropzone
        multiple={false}
        onDrop={this.onDrop}
        style={dropzoneStyle}
        accept={accept}
      >
        { children || this.renderFile }
      </Dropzone>
    );
  }
}

const mapProps = ({ ...props }) => ({
  ...props,
  ...mapError(props),
});

export default createComponent(SingleFileInput, mapProps);
