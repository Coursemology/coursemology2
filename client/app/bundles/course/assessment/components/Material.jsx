import React, { PropTypes } from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import Avatar from 'material-ui/Avatar';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import { standardDateFormat, shortTimeFormat } from 'lib/dateTimeDefaults';

const iconStyle = {
  width: 32,
  height: 32,
  padding: 4,
  marginRight: 16,
};

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
      return <CircularProgress style={iconStyle} />;
    }

    return (
      <IconButton
        iconClassName="fa fa-trash"
        onClick={this.onDelete}
        style={iconStyle}
      />
    );
  }

  render() {
    const { name, updatedAt } = this.props;
    const dateTime =
      (<div>
        <FormattedDate value={new Date(updatedAt)} {...standardDateFormat} />
        {' '}
        <FormattedTime value={updatedAt} {...shortTimeFormat} />
      </div>);

    return (
      <ListItem
        disableKeyboardFocus
        primaryText={name}
        rightAvatar={this.renderIcon()}
        leftAvatar={<Avatar icon={<ActionAssignment />} />}
        secondaryText={dateTime}
      />
    );
  }
}

Material.propTypes = propTypes;

export default Material;
