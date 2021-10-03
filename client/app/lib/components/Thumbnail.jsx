import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import formTranslations from 'lib/translations/form';

const styles = {
  dialogContent: {
    width: '90%',
    maxWidth: 'none',
  },
  dialogBody: {
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
    // eslint-disable-next-line no-unused-vars
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
      <FlatButton
        label={<FormattedMessage {...formTranslations.close} />}
        primary
        onClick={() => this.setState({ open: false })}
        key="thumbnail-close-button"
      />,
    ];

    return (
      <div style={rootStyle}>
        <div style={containerStyle}>
          <a onClick={onThumbnailClick}>
            <img src={source} alt={altText} style={thumbnailStyle} {...props} />
          </a>
        </div>
        <Dialog
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={() => this.setState({ open: false })}
          bodyStyle={styles.dialogBody}
          contentStyle={styles.dialogContent}
        >
          <img
            src={source}
            alt={altText}
            style={expandedImageStyle}
            {...props}
          />
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
