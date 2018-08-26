import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import InsertDriveFileIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import { grey400, grey900 } from 'material-ui/styles/colors';
import DeleteButton from './DeleteButton';
import translations from './translations';

const styles = {
  image: {
    maxWidth: '100%',
    maxHeight: 300,
    width: 'auto',
    height: 'auto',
  },
  imageContainer: {
    position: 'relative',
    display: 'inline-block',
    paddingRight: 30,
    paddingLeft: 30,
  },
};

function renderImage(imageSrc, fileName) {
  return imageSrc ? <img src={imageSrc} style={styles.image} alt={fileName} /> : (
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

export default class ImagePreview extends React.Component {
  static propTypes = {
    file: PropTypes.object,
    originalName: PropTypes.string,
    originalUrl: PropTypes.string,
    handleCancel: PropTypes.func,
    render: PropTypes.func,
  };

  static defaultProps = {
    render: renderImage,
  };

  getImage() {
    const { originalUrl, file } = this.props;
    const isImage = file.type.includes('image/');

    let imageSrc = null;
    if (isImage) {
      imageSrc = file.preview;
    } else if (originalUrl) {
      imageSrc = originalUrl;
    }

    return imageSrc;
  }

  render() {
    const { file, originalName, originalUrl, handleCancel, render } = this.props;
    const fileName = file ? file.name : originalName;
    const imageSrc = file ? this.getImage() : originalUrl;

    return (
      <React.Fragment>
        <div style={styles.imageContainer}>
          {this.props.file && <DeleteButton handleCancel={handleCancel} />}
          {render(imageSrc, fileName)}
        </div>
        <div className="file-name">{fileName}</div>
        <div><FormattedMessage {...translations.dropzone} /></div>
      </React.Fragment>
    );
  }
}
