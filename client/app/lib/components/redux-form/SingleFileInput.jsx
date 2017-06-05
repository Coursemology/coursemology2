import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, intlShape } from 'react-intl';
import Dropzone from 'react-dropzone';
import Avatar from 'material-ui/Avatar';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import InsertDriveFileIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import { grey300, grey400 } from 'material-ui/styles/colors';
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
  badgeIconActive: {
    backgroundColor: grey400,
  },
  badgeIconInactive: {
    backgroundColor: grey300,
  },
  dropzone: {
    backgroundColor: grey300,
    borderRadius: 5,
    height: 200,
    paddingTop: 15,
    textAlign: 'center',
    width: '100%',
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
 *
 * Additional format of form props (see createComponent for base set):
 * {
 *   ...createComponent,
 *   value: {
 *      url, // URL of preview of existing file if it is an image, otherwise nil.
 *     name, // Name of existing file, if any.
 *   }
 * }
 */
class SingleFileInput extends React.Component {
  static propTypes = {
    value: PropTypes.shape({
      url: PropTypes.string,
      name: PropTypes.string,
    }),
    input: PropTypes.shape({
      onChange: PropTypes.func.isRequired,
    }),
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { file: null };
  }

  onDrop = (files) => {
    this.setState({ file: files[0] }, this.updateStore(files[0]));
  }

  onCancel = () => {
    this.setState({ file: null }, this.updateStore(undefined));
  }

  updateStore = (file) => {
    const { input: { onChange }, value: { url, name } } = this.props;
    onChange({ file, url, name });
  }

  badgeContent = () => {
    const { intl } = this.props;
    return (
      <IconButton
        tooltip={intl.formatMessage(translations.removeFile)}
        onTouchTap={this.onCancel}
      >
        <CloseIcon />
      </IconButton>
    );
  }

  renderFile = () => {
    const { value: { url, name } } = this.props;
    const isChanged = this.state.file !== null;
    const isImage = isChanged && this.state.file.type.includes('image/');
    const fileName = isChanged ? this.state.file.name : name;

    const avatarProps = { size: 100, style: styles.avatar };
    if (isImage) {
      avatarProps.src = this.state.file.preview;
    } else if (url) {
      avatarProps.src = url;
    } else {
      avatarProps.icon = (<InsertDriveFileIcon />);
    }

    return (
      <div>
        <Badge
          badgeContent={isChanged && this.badgeContent()}
          badgeStyle={isChanged ? styles.badgeIconActive : styles.badgeIconInactive}
          style={styles.badge}
        >
          <Avatar {...avatarProps} />
          <div className="file-name">
            {fileName}
            {fileName && fileName.length > 0 && <br />}
          </div>
        </Badge>
        <div>
          <FormattedMessage {...translations.dropzone} />
        </div>
      </div>
    );
  }

  render() {
    return (
      <Dropzone
        multiple={false}
        onDrop={this.onDrop}
        style={styles.dropzone}
      >
        {this.renderFile}
      </Dropzone>
    );
  }
}

const mapProps = ({ ...props }) => ({
  ...props,
  ...mapError(props),
});

export default createComponent(SingleFileInput, mapProps);
