import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CheckCircleOutline } from '@mui/icons-material';
import {
  Avatar,
  Button,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { grey, orange } from '@mui/material/colors';
import PropTypes from 'prop-types';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { formatLongDateTime } from 'lib/moment';

import { postShape } from '../../propTypes';

const translations = defineMessages({
  deleteConfirmation: {
    id: 'course.assessment.submission.comment.CommentCard.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this comment?',
  },
  cancel: {
    id: 'course.assessment.submission.comment.CommentCard.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course.assessment.submission.comment.CommentCard.save',
    defaultMessage: 'Save',
  },
  publish: {
    id: 'course.assessment.submission.comment.CommentCard.publish',
    defaultMessage: 'Publish',
  },
  isAiGenerated: {
    id: 'course.assessment.submission.comment.CommentCard.isAiGenerated',
    defaultMessage: 'AI Generated Comment',
  },
});

const styles = {
  avatar: {
    height: '25px',
    width: '25px',
  },
  card: {
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 0.2,
    borderColor: grey[400],
    borderRadius: 3,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: grey[100],
    borderRadius: 3,
  },
  delayedHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: orange[100],
    borderRadius: 3,
  },
  cardHeader: {
    padding: 6,
  },
  buttonContainer: {
    display: 'flex',
    marginRight: 5,
    marginBottom: 2,
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

  onConfirmDelete() {
    const { deleteComment } = this.props;
    deleteComment();
    this.setState({ deleteConfirmation: false });
  }

  onDelete() {
    this.setState({ deleteConfirmation: true });
  }

  onSave() {
    const { editValue } = this.props;
    this.props.updateComment(editValue);
    this.setState({ editMode: false });
  }

  onPublish() {
    const { editValue } = this.props;
    this.props.publishComment(editValue);
    this.setState({ editMode: false });
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
      post: { text, id, workflowState },
    } = this.props;

    const isDraft = workflowState === POST_WORKFLOW_STATE.draft;

    if (editMode) {
      return (
        <>
          <CKEditorRichText
            id={id.toString()}
            inputId={CommentCard.editPostIdentifier(id)}
            onChange={(nextValue) => this.onChange(nextValue)}
            value={editValue}
          />
          <div style={styles.buttonContainer}>
            <Button
              color="secondary"
              onClick={() => this.setState({ editMode: false })}
            >
              <FormattedMessage {...translations.cancel} />
            </Button>
            {isDraft ? (
              <Button color="primary" onClick={() => this.onPublish()}>
                <FormattedMessage {...translations.publish} />
              </Button>
            ) : (
              <Button color="primary" onClick={() => this.onSave()}>
                <FormattedMessage {...translations.save} />
              </Button>
            )}
          </div>
        </>
      );
    }

    return (
      <Typography dangerouslySetInnerHTML={{ __html: text }} variant="body2" />
    );
  }

  render() {
    const {
      creator: { name, imageUrl },
      createdAt,
      canUpdate,
      canDestroy,
      id,
      isDelayed,
      isAiGenerated,
    } = this.props.post;

    const { post, isUpdatingAnnotationAllowed, editValue, publishComment } =
      this.props;

    const isDraft = post.workflowState === POST_WORKFLOW_STATE.draft;

    return (
      <div id={CommentCard.postIdentifier(id)} style={styles.card}>
        <div
          style={isDelayed || isDraft ? styles.delayedHeader : styles.header}
        >
          <CardHeader
            avatar={
              isAiGenerated && isDraft ? null : (
                <Avatar src={imageUrl} style={styles.avatar} />
              )
            }
            style={styles.cardHeader}
            subheader={`${formatLongDateTime(createdAt)}${
              isDelayed ? ' (delayed comment)' : ''
            }`}
            subheaderTypographyProps={{ display: 'block' }}
            title={
              isAiGenerated && isDraft ? (
                <FormattedMessage {...translations.isAiGenerated} />
              ) : (
                name
              )
            }
            titleTypographyProps={{
              display: 'block',
              fontSize: '1.5rem',
            }}
          />
          <div style={styles.buttonContainer}>
            {isDraft && (
              <Tooltip title={<FormattedMessage {...translations.publish} />}>
                <IconButton
                  disabled={this.state.editMode}
                  onClick={() => publishComment(editValue)}
                >
                  <CheckCircleOutline />
                </IconButton>
              </Tooltip>
            )}
            {canUpdate && isUpdatingAnnotationAllowed ? (
              <EditButton
                className="edit-comment"
                disabled={this.state.editMode}
                onClick={() => this.toggleEditMode()}
              />
            ) : null}
            {canDestroy && isUpdatingAnnotationAllowed ? (
              <DeleteButton
                className="delete-comment"
                onClick={() => this.onDelete()}
              />
            ) : null}
          </div>
        </div>
        <div style={styles.commentContent}>{this.renderCommentContent()}</div>
        <ConfirmationDialog
          confirmDelete
          message={<FormattedMessage {...translations.deleteConfirmation} />}
          onCancel={() => this.setState({ deleteConfirmation: false })}
          onConfirm={() => this.onConfirmDelete()}
          open={this.state.deleteConfirmation}
        />
      </div>
    );
  }
}

CommentCard.propTypes = {
  post: postShape.isRequired,
  editValue: PropTypes.string,

  handleChange: PropTypes.func,
  updateComment: PropTypes.func,
  deleteComment: PropTypes.func,
  publishComment: PropTypes.func,
  isUpdatingAnnotationAllowed: PropTypes.bool,
};
