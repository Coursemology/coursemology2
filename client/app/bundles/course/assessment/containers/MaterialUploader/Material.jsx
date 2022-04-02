import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { formatLongDateTime } from 'lib/moment';
import {
  Avatar,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import Assignment from '@mui/icons-material/Assignment';
import Delete from '@mui/icons-material/Delete';
import ReactTooltip from 'react-tooltip';

const styles = {
  avatar: {
    height: '32px',
    width: '32px',
  },
  iconButton: {
    color: 'black',
    width: 24,
    height: 24,
    padding: 4,
    marginRight: 16,
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
        <Delete
          data-tip
          data-for="delete-file-button"
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
      <ListItem button>
        <ListItemAvatar>
          <Avatar style={styles.avatar}>
            <Assignment />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={name} secondary={this.renderSecondaryText()} />
        <ListItemSecondaryAction>{this.renderIcon()}</ListItemSecondaryAction>
      </ListItem>
    );
  }
}

Material.propTypes = propTypes;

export default Material;
