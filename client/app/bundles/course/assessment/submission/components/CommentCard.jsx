import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { red500, grey100 } from 'material-ui/styles/colors';
import MaterialSummernote from 'lib/components/MaterialSummernote';
/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import moment from 'lib/moment';
/* eslint-enable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */

import { postShape } from '../propTypes';

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
    wordWrap: 'break-word',
    padding: 7,
  },
};

export default class CommentCard extends Component {
  static formatDateTime(dateTime) {
    return dateTime ? moment(dateTime).format('MMM DD, YYYY h:mma') : null;
  }

  static editPostIdentifier(field) {
    return `edit_post_${field}`;
  }

  static postIdentifier(field) {
    return `post_${field}`;
  }

  static propTypes = {
    post: postShape.isRequired,
    editValue: PropTypes.string,
    airMode: PropTypes.bool,

    handleChange: PropTypes.func,
    updateComment: PropTypes.func,
    deleteComment: PropTypes.func,
  }

  static defaultProps = {
    airMode: true,
  };

  state = {
    editMode: false,
    deleteConfirmation: false,
  }

  onChange(nextValue) {
    const { handleChange } = this.props;
    handleChange(nextValue);
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
    const { editValue, airMode, post: { formattedText, id } } = this.props;

    if (editMode) {
      return (
        <>
          <MaterialSummernote
            airMode={airMode}
            id={id.toString()}
            inputId={CommentCard.editPostIdentifier(id)}
            onChange={nextValue => this.onChange(nextValue)}
            value={editValue}
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
        </>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  }

  render() {
    const { creator: { name, avatar }, createdAt, canUpdate, canDestroy, id } = this.props.post;
    return (
      <Card
        id={CommentCard.postIdentifier(id)}
        style={styles.card}
      >
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
            { canUpdate ? (
              <FlatButton
                className="edit-comment"
                style={styles.headerButton}
                labelStyle={styles.headerButton}
                icon={<EditIcon />}
                onClick={() => this.toggleEditMode()}
              />
            ) : null }
            { canDestroy ? (
              <FlatButton
                className="delete-comment"
                style={styles.headerButton}
                labelStyle={styles.headerButton}
                icon={<DeleteIcon color={red500} />}
                onClick={() => this.onDelete()}
              />
            ) : null }
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
