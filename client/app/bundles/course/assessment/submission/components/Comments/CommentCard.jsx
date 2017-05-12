/* eslint-disable react/no-danger */

import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { red500, grey100 } from 'material-ui/styles/colors';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import moment from 'lib/moment';
/* eslint-enable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */

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
    marginRight: 5,
    marginBottom: 2,
  },
  headerButton: {
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
    saveComment: PropTypes.func,
    deleteComment: PropTypes.func,
  }

  static formatDateTime(dateTime) {
    return dateTime ? moment(dateTime).format('MMM DD, YYYY h:mma') : null;
  }

  state = {
    editMode: false,
    deleteConfirmation: false,
  }

  onSave() {
    this.props.saveComment();
    this.setState({ editMode: false });
  }

  onDelete() {
    this.setState({ deleteConfirmation: true });
  }

  toggleEditMode() {
    const { editMode } = this.state;
    this.setState({ editMode: !editMode });
  }

  renderCommentContent() {
    const { editMode } = this.state;
    const { content } = this.props;

    if (editMode) {
      return (
        <div>
          <TextField
            fullWidth
            multiLine
            rows={2}
            rowsMax={4}
            defaultValue={content}
          />
          <div style={styles.buttonContainer}>
            <FlatButton
              style={styles.editButton}
              labelStyle={styles.editButton}
              label="Cancel"
              onClick={() => this.setState({ editMode: false })}
            />
            <FlatButton
              style={styles.deleteButton}
              labelStyle={styles.deleteButton}
              label="Save"
              primary
              onClick={() => this.onSave()}
            />
          </div>
        </div>
      );
    }
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  render() {
    const { name, avatar, date, deleteComment } = this.props;
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
              style={styles.headerButton}
              labelStyle={styles.headerButton}
              icon={<EditIcon />}
              onClick={() => this.toggleEditMode()}
            />
            <FlatButton
              style={styles.headerButton}
              labelStyle={styles.headerButton}
              icon={<DeleteIcon color={red500} />}
              onClick={() => this.onDelete()}
            />
          </div>
        </div>
        <CardText style={styles.commentContent}>
          {this.renderCommentContent()}
        </CardText>
        <ConfirmationDialog
          confirmDelete
          open={this.state.deleteConfirmation}
          onCancel={() => this.setState({ deleteConfirmation: false })}
          onConfirm={() => deleteComment()}
        />
      </Card>
    );
  }
}
