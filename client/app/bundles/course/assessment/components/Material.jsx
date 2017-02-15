import React, { PropTypes } from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import Avatar from 'material-ui/Avatar';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import { standardDateFormat, shortTimeFormat } from 'lib/dateTimeDefaults';

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
  }
}

const propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  onMaterialDelete: PropTypes.func,
  deleting: PropTypes.bool,
};

class Material extends React.Component {
  onDelete = (e) => {
    e.preventDefault();
    const { url, onMaterialDelete } = this.props;
    onMaterialDelete(url);
  }

  renderIcon() {
    if (this.props.deleting) {
      return <CircularProgress size={24} style={styles.iconButton} />;
    }

    return (
      <IconButton
        iconClassName="fa fa-trash"
        onClick={this.onDelete}
        style={styles.iconButton}
      />
    );
  }

  render() {
    const { name, updatedAt } = this.props;
    const dateTime =
      (<div style={styles.secondaryText}>
        <FormattedDate value={new Date(updatedAt)} {...standardDateFormat} />
        {' '}
        <FormattedTime value={updatedAt} {...shortTimeFormat} />
      </div>);

    return (
      <ListItem
        disableKeyboardFocus
        primaryText={name}
        rightAvatar={this.renderIcon()}
        leftAvatar={<Avatar size = {32} style={styles.avatar} icon={<ActionAssignment />} />}
        secondaryText={dateTime}
        style={styles.root}
        innerDivStyle={styles.innerDiv}
      />
    );
  }
}

Material.propTypes = propTypes;

export default Material;
