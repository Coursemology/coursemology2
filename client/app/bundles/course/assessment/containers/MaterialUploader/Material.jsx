import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import Avatar from 'material-ui/Avatar';
import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import PropTypes from 'prop-types';

import { formatLongDateTime } from 'lib/moment';

const styles = {
  root: {
    fontSize: 14,
    lineHeight: '14px',
  },
  innerDiv: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  avatar: {
    top: 8,
  },
  iconButton: {
    width: 24,
    height: 24,
    padding: 4,
    marginRight: 16,
    top: 8,
  },
  secondaryText: {
    fontSize: 12,
  },
};

const translations = defineMessages({
  uploading: {
    id: 'course.material.uploading',
    defaultMessage: 'Uploading',
  },
  disableDelete: {
    id: 'course.material.disableDelete',
    defaultMessage:
      'This action is unavailable as the Materials Component is disabled in the Admin Settings',
  },
});

const propTypes = {
  id: PropTypes.number,
  name: PropTypes.string.isRequired,
  updatedAt: PropTypes.string,
  onMaterialDelete: PropTypes.func,
  deleting: PropTypes.bool,
  uploading: PropTypes.bool,
  disabled: PropTypes.bool,
};

class Material extends Component {
  onDelete = (e) => {
    e.preventDefault();
    const { id, name, onMaterialDelete } = this.props;
    if (onMaterialDelete) onMaterialDelete(id, name);
  };

  renderIcon() {
    const { disabled } = this.props;
    if (this.props.deleting || this.props.uploading) {
      return <CircularProgress size={24} style={styles.iconButton} />;
    }

    return (
      <IconButton
        disabled={disabled}
        onClick={this.onDelete}
        style={styles.iconButton}
      >
        <DeleteIcon
          data-for="delete-file-button"
          data-tip={true}
          data-tip-disable={!disabled}
        />
        <ReactTooltip id="delete-file-button">
          <FormattedMessage {...translations.disableDelete} />
        </ReactTooltip>
      </IconButton>
    );
  }

  renderSecondaryText() {
    if (this.props.uploading) {
      return <FormattedMessage {...translations.uploading} />;
    }
    const { updatedAt } = this.props;
    return (
      <div style={styles.secondaryText}>{formatLongDateTime(updatedAt)}</div>
    );
  }

  render() {
    const { name } = this.props;

    return (
      <ListItem
        disableKeyboardFocus={true}
        innerDivStyle={styles.innerDiv}
        leftAvatar={
          <Avatar icon={<ActionAssignment />} size={32} style={styles.avatar} />
        }
        primaryText={name}
        rightAvatar={this.renderIcon()}
        secondaryText={this.renderSecondaryText()}
        style={styles.root}
      />
    );
  }
}

Material.propTypes = propTypes;

export default Material;
