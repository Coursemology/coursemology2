import { PureComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';
import formTranslations from 'lib/translations/form';

const styles = {
  dialogContent: {
    display: 'flex',
    justifyContent: 'space-around',
  },
};

class Thumbnail extends PureComponent {
  constructor(props) {
    super(props);
    const { src, file } = props;
    const isFromFile = !src && file;

    this.state = {
      src: null,
      alt: isFromFile ? file.name : null,
      open: false,
    };

    if (isFromFile) {
      this.fetchImageFromFile(file);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { src, file } = nextProps;
    const isFromFile = !src && file;

    if (isFromFile && this.state.file !== file) {
      this.fetchImageFromFile(file);
    }
  }

  fetchImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => this.setState({ src: reader.result });
    reader.readAsDataURL(file);
  }

  render() {
    const {
      src,
      alt,
      file,
      onClick,
      style,
      containerStyle,
      rootStyle,
      ...props
    } = this.props;
    const source = src || this.state.src;
    const altText = alt || this.state.alt || src;

    const thumbnailStyle = {
      ...style,
      cursor: 'zoom-in',
    };

    const expandedImageStyle = {
      ...style,
      width: 'auto',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    };

    const onThumbnailClick =
      onClick && typeof onClick === 'function'
        ? (event) => {
            onClick(event);
            this.setState({ open: true });
          }
        : () => this.setState({ open: true });

    const actions = [
      <Button
        key="thumbnail-close-button"
        color="primary"
        onClick={() => this.setState({ open: false })}
      >
        <FormattedMessage {...formTranslations.close} />
      </Button>,
    ];

    return (
      <div style={rootStyle}>
        <div style={containerStyle}>
          <Link onClick={onThumbnailClick} underline="none">
            <img alt={altText} src={source} style={thumbnailStyle} {...props} />
          </Link>
        </div>
        <Dialog
          maxWidth="xl"
          onClose={() => this.setState({ open: false })}
          open={this.state.open}
        >
          <DialogContent style={{ ...styles.dialogContent }}>
            <img
              alt={altText}
              src={source}
              style={expandedImageStyle}
              {...props}
            />
          </DialogContent>
          <DialogActions>{actions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}

Thumbnail.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  file: PropTypes.instanceOf(File),
  onClick: PropTypes.func,
  style: PropTypes.shape({}),
  rootStyle: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
};

export default Thumbnail;
