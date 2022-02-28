import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardContent,
} from '@material-ui/core';
import { grey, orange, red } from '@material-ui/core/colors';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import { defineMessages, FormattedMessage } from 'react-intl';
import MaterialSummernote from 'lib/components/MaterialSummernote';
/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import moment from 'lib/moment';
/* eslint-enable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */

import { postShape } from '../propTypes';

const translations = defineMessages({
  deleteConfirmation: {
    id: 'course.assessment.submission.CommentCard.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this comment?',
  },
  cancel: {
    id: 'course.assessment.submission.CommentCard.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course.assessment.submission.CommentCard.save',
    defaultMessage: 'Save',
  },
});

const styles = {
  avatar: {
    height: '25px',
    width: '25px',
  },
  card: {
    marginBottom: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: grey[100],
  },
  delayedHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: orange[100],
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

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      deleteConfirmation: false,
    };
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
    const {
      handleChange,
      post: { text },
    } = this.props;
    this.setState({ editMode: !editMode });
    handleChange(text);
  }

  renderCommentContent() {
    const { editMode } = this.state;
    const {
      editValue,
      airMode,
      post: { formattedText, id },
    } = this.props;

    if (editMode) {
      return (
        <>
          <MaterialSummernote
            airMode={airMode}
            id={id.toString()}
            inputId={CommentCard.editPostIdentifier(id)}
            onChange={(nextValue) => this.onChange(nextValue)}
            value={editValue}
          />
          <div style={styles.buttonContainer}>
            <Button onClick={() => this.setState({ editMode: false })}>
              <FormattedMessage {...translations.cancel} />
            </Button>
            <Button color="primary" onClick={() => this.onSave()}>
              <FormattedMessage {...translations.save} />
            </Button>
          </div>
        </>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  }

  render() {
    const {
      creator: { name, avatar },
      createdAt,
      canUpdate,
      canDestroy,
      id,
      isDelayed,
    } = this.props.post;
    return (
      <Card id={CommentCard.postIdentifier(id)} style={styles.card}>
        <div style={isDelayed ? styles.delayedHeader : styles.header}>
          <CardHeader
            avatar={<Avatar src={avatar} style={styles.avatar} />}
            title={name}
            titleTypographyProps={{ display: 'inline-block', marginright: 20 }}
            subheader={`${CommentCard.formatDateTime(createdAt)}${
              isDelayed ? ' (delayed comment)' : ''
            }`}
            subheaderTypographyProps={{ display: 'inline-block' }}
            style={styles.cardHeader}
          />
          <div style={styles.buttonContainer}>
            {canUpdate ? (
              <Button
                className="edit-comment"
                onClick={() => this.toggleEditMode()}
                style={styles.headerButton}
              >
                <Edit />
              </Button>
            ) : null}
            {canDestroy ? (
              <Button
                className="delete-comment"
                onClick={() => this.onDelete()}
                style={styles.headerButton}
              >
                <Delete nativeColor={red[500]} />
              </Button>
            ) : null}
          </div>
        </div>
        <CardContent style={styles.commentContent}>
          {this.renderCommentContent()}
        </CardContent>
        <ConfirmationDialog
          confirmDelete
          open={this.state.deleteConfirmation}
          message={<FormattedMessage {...translations.deleteConfirmation} />}
          onCancel={() => this.setState({ deleteConfirmation: false })}
          onConfirm={() => this.onConfirmDelete()}
        />
      </Card>
    );
  }
}

CommentCard.propTypes = {
  post: postShape.isRequired,
  editValue: PropTypes.string,
  airMode: PropTypes.bool,

  handleChange: PropTypes.func,
  updateComment: PropTypes.func,
  deleteComment: PropTypes.func,
};

CommentCard.defaultProps = {
  airMode: true,
};
