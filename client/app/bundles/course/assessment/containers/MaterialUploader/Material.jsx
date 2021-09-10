import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { formatLongDateTime } from 'lib/moment';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import Avatar from 'material-ui/Avatar';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import ReactTooltip from 'react-tooltip';

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

class Material extends React.Component {
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
        onClick={this.onDelete}
        style={styles.iconButton}
        disabled={disabled}
      >
        <DeleteIcon data-tip data-for='delete-file-button' data-tip-disable={!disabled}/>
        <ReactTooltip id='delete-file-button'>
          <FormattedMessage {...translations.disableDelete}/>
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
        disableKeyboardFocus
        primaryText={name}
        rightAvatar={this.renderIcon()}
        leftAvatar={
          <Avatar size={32} style={styles.avatar} icon={<ActionAssignment />} />
        }
        secondaryText={this.renderSecondaryText()}
        style={styles.root}
        innerDivStyle={styles.innerDiv}
      />
    );
  }
}

Material.propTypes = propTypes;

export default Material;
