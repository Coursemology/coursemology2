/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { red500, grey100 } from 'material-ui/styles/colors';
import { PostProp } from '../propTypes';

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
  headerButtonHidden: {
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
    post: PostProp.isRequired,
    editValue: PropTypes.string,

    handleChange: PropTypes.func,
    updateComment: PropTypes.func,
    deleteComment: PropTypes.func,
  }

  static formatDateTime(dateTime) {
    return dateTime ? moment(dateTime).format('MMM DD, YYYY h:mma') : null;
  }

  state = {
    editMode: false,
    deleteConfirmation: false,
  }

  onChange(event) {
    const { handleChange } = this.props;
    handleChange(event.target.value);
  }

  onSave() {
    const { editValue } = this.props;
    this.props.updateComment(editValue);
    this.setState({ editMode: false });
  }

  onDelete() {
    this.setState({ deleteConfirmation: true });
  }

  onConfirmDelete() {
    const { deleteComment } = this.props;
    deleteComment();
    this.setState({ deleteConfirmation: false });
  }

  toggleEditMode() {
    const { editMode } = this.state;
    const { handleChange, post: { text } } = this.props;
    this.setState({ editMode: !editMode });
    handleChange(text);
  }

  renderCommentContent() {
    const { editMode } = this.state;
    const { editValue, post: { text, id } } = this.props;

    if (editMode) {
      return (
        <div>
          <TextField
            id={id.toString()}
            fullWidth
            multiLine
            rows={2}
            rowsMax={4}
            value={editValue}
            onChange={event => this.onChange(event)}
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
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }

  render() {
    const { creator: { name, avatar }, createdAt, canUpdate, canDestroy } = this.props.post;
    return (
      <Card style={styles.card}>
        <div style={styles.header}>
          <CardHeader
            style={styles.cardHeader}
            title={name}
            subtitle={CommentCard.formatDateTime(createdAt)}
            titleStyle={{ display: 'inline-block', marginRight: 20 }}
            subtitleStyle={{ display: 'inline-block' }}
            avatar={<Avatar src={avatar} size={25} />}
          />
          <div style={styles.buttonContainer}>
            { canUpdate ? <FlatButton
              style={styles.headerButton}
              labelStyle={styles.headerButton}
              icon={<EditIcon />}
              onClick={() => this.toggleEditMode()}
            /> : null }
            { canDestroy ? <FlatButton
              style={styles.headerButton}
              labelStyle={styles.headerButton}
              icon={<DeleteIcon color={red500} />}
              onClick={() => this.onDelete()}
            /> : null }
          </div>
        </div>
        <CardText style={styles.commentContent}>
          {this.renderCommentContent()}
        </CardText>
        <ConfirmationDialog
          confirmDelete
          open={this.state.deleteConfirmation}
          onCancel={() => this.setState({ deleteConfirmation: false })}
          onConfirm={() => this.onConfirmDelete()}
        />
      </Card>
    );
  }
}
