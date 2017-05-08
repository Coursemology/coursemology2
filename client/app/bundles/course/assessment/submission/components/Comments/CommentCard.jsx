import React, { Component, PropTypes } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

const styles = {
  header: {
    display: 'flex',
  },
};

export default class CommentCard extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    content: PropTypes.string,
    onDelete: PropTypes.func,
  }

  state = {
    editMode: false,
  }

  toggleEditMode() {
    const { editMode } = this.state;
    this.setState({ editMode: !editMode });
  }

  render() {
    const { name, avatar, date, content, onDelete } = this.props;
    return (
      <Card>
        <div style={styles.header}>
          <CardHeader
            title={name}
            avatar={avatar}
          />
          {date}
          <FlatButton icon={<i className="fa fa-edit" />} onClick={this.toggleEditMode} />
          <FlatButton icon={<i className="fa fa-trash" />} onClick={onDelete} />
        </div>
        <CardText>{content}</CardText>
      </Card>
    );
  }
}
