/* eslint-disable react/no-danger */

import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/Avatar';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { red500, grey100 } from 'material-ui/styles/colors';
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import moment from 'lib/moment';

const styles = {
  card: {
    marginBottom: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: grey100,
  },
  cardHeader: {
    padding: 6,
  },
  buttonContainer: {
    display: 'flex',
  },
  editButton: {
    height: 35,
    width: 40,
    minWidth: 40,
  },
  deleteButton: {
    height: 35,
    width: 40,
    minWidth: 40,
  },
  commentContent: {
    padding: 7,
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

  static formatDateTime(dateTime) {
    return dateTime ? moment(dateTime).format('MMM DD, YYYY h:mma') : null;
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
      <Card style={styles.card}>
        <div style={styles.header}>
          <CardHeader
            style={styles.cardHeader}
            title={name}
            avatar={<Avatar src={avatar} size={25} />}
          />
          {CommentCard.formatDateTime(date)}
          <div style={styles.buttonContainer}>
            <FlatButton
              style={styles.editButton}
              labelStyle={styles.editButton}
              backgroundColor="white"
              icon={<i className="fa fa-edit" />}
              onClick={() => this.toggleEditMode()}
            />
            <FlatButton
              style={styles.deleteButton}
              labelStyle={styles.deleteButton}
              backgroundColor={red500}
              icon={<i className="fa fa-trash" />}
              onClick={onDelete}
            />
          </div>
        </div>
        <CardText style={styles.commentContent}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </CardText>
      </Card>
    );
  }
}
