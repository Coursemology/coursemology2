import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import { Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

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
  return imageSrc ? (
    <img alt={fileName} src={imageSrc} style={styles.image} />
  ) : (
    <div>
      <InsertDriveFile
        style={{
          ...styles.fileIcon,
          color: fileName ? grey[900] : grey[400],
        }}
      />
    </div>
  );
}

export default class ImagePreview extends Component {
  getImage() {
    const { originalUrl, file } = this.props;
    const isImage = file.type.includes('image/');

    let imageSrc = null;
    if (isImage) {
      imageSrc = URL.createObjectURL(file);
    } else if (originalUrl) {
      imageSrc = originalUrl;
    }

    return imageSrc;
  }

  render() {
    const { file, originalName, originalUrl, handleCancel, render } =
      this.props;
    const fileName = file ? file.name : originalName;
    const imageSrc = file ? this.getImage() : originalUrl;

    return (
      <>
        <div style={styles.imageContainer}>
          {this.props.file && <DeleteButton handleCancel={handleCancel} />}
          {render(imageSrc, fileName)}
        </div>
        <div className="file-name">{fileName}</div>
        <Typography>
          <FormattedMessage {...translations.dropzone} />
        </Typography>
      </>
    );
  }
}

ImagePreview.propTypes = {
  file: PropTypes.object,
  originalName: PropTypes.string,
  originalUrl: PropTypes.string,
  handleCancel: PropTypes.func,
  render: PropTypes.func,
};

ImagePreview.defaultProps = {
  render: renderImage,
};
