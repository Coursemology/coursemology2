import React, { PropTypes } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import Badge from 'material-ui/Badge';
import Dropzone from 'react-dropzone';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

const styles = {
  badge: {
    height: '120px',
    marginRight: '1em',
    width: '120px',
  },
  badgeIconActive: {
    backgroundColor: 'rgb(200,200,200)',
  },
  badgeIconInactive: {
    backgroundColor: 'rgb(225,225,225)',
  },
  dropzone: {
    backgroundColor: 'rgb(225,225,225)',
    borderRadius: '5px',
    height: '200px',
    paddingTop: '30px',
    textAlign: 'center',
    width: '100%',
  },
};

const translations = defineMessages({
  badgeUploaderTitle: {
    id: 'course.achievement.badgeUploaderTitle',
    defaultMessage: 'Click to select a new file, or drag and drop it into the zone.',
  },
});

const propTypes = {
  currentFileUrl: PropTypes.string,
  intl: intlShape.isRequired,
};

class BadgeUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { files: [] };
  }

  onDrop = (files) => {
    this.setState({ files });
  }

  badgeContent = () => {
    if (this.state.files.length === 0) { return ''; }
    return (
      <IconButton
        tooltip="Remove Picture"
        onTouchTap={() => { this.setState({ files: [] }); }}
      >
        <CloseIcon />
      </IconButton>
    );
  }

  renderBadge = () => {
    const { currentFileUrl } = this.props;
    return (
      <Badge
        badgeContent={this.badgeContent()}
        badgeStyle={this.state.files.length > 0 ? styles.badgeIconActive : styles.badgeIconInactive}
        style={styles.badge}
      >
        <Avatar
          size={100}
          src={this.state.files.length > 0 ? this.state.files[0].preview : currentFileUrl}
        />
      </Badge>
    );
  }

  renderFile = () => {
    const { intl } = this.props;
    return (
      <div>
        {this.renderBadge()}
        {intl.formatMessage(translations.badgeUploaderTitle)}
      </div>
    );
  }

  render() {
    return (
      <Dropzone
        inputProps={{
          id: 'badge',
          name: 'achievement[badge]',
        }}
        style={styles.dropzone}
        multiple={false}
        onDrop={this.onDrop}
      >
        {this.renderFile}
      </Dropzone>
    );
  }
}

BadgeUploader.propTypes = propTypes;

export default injectIntl(BadgeUploader);
