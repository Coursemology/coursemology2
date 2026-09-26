import { FC, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CheckCircleOutline } from '@mui/icons-material';
import { Avatar, Button, CardHeader, IconButton, Tooltip } from '@mui/material';
import { grey, orange } from '@mui/material/colors';
import { CommentPostMiniEntity } from 'types/course/comments';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { formatLongDateTime } from 'lib/moment';

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
  commentContent: {
    wordWrap: 'break-word',
    padding: 7,
  },
} as const;

// DOM ids the submission feature specs locate comments by.
const postIdentifier = (postId: number): string => `post_${postId}`;
const editPostIdentifier = (postId: number): string => `edit_post_${postId}`;

interface Props {
  post: CommentPostMiniEntity;
  // The edit box's current text, held in the commentForms slice so it survives re-renders.
  editValue?: string;
  handleChange: (value: string) => void;
  updateComment: (value?: string) => void;
  deleteComment: () => void;
  // Only question comments can be drafts awaiting publication; annotations do not pass this.
  publishComment?: (value?: string) => void;
  isUpdatingAnnotationAllowed?: boolean;
}

const CommentCard: FC<Props> = (props) => {
  const {
    post,
    editValue,
    handleChange,
    updateComment,
    deleteComment,
    publishComment,
    isUpdatingAnnotationAllowed,
  } = props;
  const {
    id,
    text,
    creator,
    createdAt,
    canUpdate,
    canDestroy,
    isDelayed,
    isAiGenerated,
  } = post;

  const [editMode, setEditMode] = useState(false);

  const isDraft = post.workflowState === POST_WORKFLOW_STATE.draft;

  const startEditing = (): void => {
    setEditMode(true);
    handleChange(text);
  };

  const save = (): void => {
    updateComment(editValue);
    setEditMode(false);
  };

  const publish = (): void => {
    publishComment?.(editValue);
    setEditMode(false);
  };

  const renderCommentContent = (): JSX.Element => {
    if (!editMode) return <UserHTMLText html={text} />;

    return (
      <>
        <CKEditorRichText
          inputId={editPostIdentifier(id)}
          name={editPostIdentifier(id)}
          onChange={handleChange}
          value={editValue ?? ''}
        />
        <div style={styles.buttonContainer}>
          <Button color="secondary" onClick={(): void => setEditMode(false)}>
            <FormattedMessage {...translations.cancel} />
          </Button>
          {isDraft ? (
            <Button color="primary" onClick={publish}>
              <FormattedMessage {...translations.publish} />
            </Button>
          ) : (
            <Button color="primary" onClick={save}>
              <FormattedMessage {...translations.save} />
            </Button>
          )}
        </div>
      </>
    );
  };

  return (
    <div id={postIdentifier(id)} style={styles.card}>
      <div style={isDelayed || isDraft ? styles.delayedHeader : styles.header}>
        <CardHeader
          avatar={
            isAiGenerated && isDraft ? null : (
              <Avatar src={creator.imageUrl} style={styles.avatar} />
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
              creator.name
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
                disabled={editMode}
                onClick={(): void => publishComment?.(editValue)}
              >
                <CheckCircleOutline />
              </IconButton>
            </Tooltip>
          )}
          {canUpdate && isUpdatingAnnotationAllowed ? (
            <EditButton
              className="edit-comment"
              disabled={editMode}
              onClick={startEditing}
            />
          ) : null}
          {canDestroy && isUpdatingAnnotationAllowed ? (
            <DeleteButton
              className="delete-comment"
              confirmMessage={
                <FormattedMessage {...translations.deleteConfirmation} />
              }
              disabled={false}
              // Not awaited, so the prompt closes on confirmation as it always has, and cannot be confirmed twice
              // while the request is in flight.
              onClick={async (): Promise<void> => deleteComment()}
            />
          ) : null}
        </div>
      </div>
      <div style={styles.commentContent}>{renderCommentContent()}</div>
    </div>
  );
};

export default CommentCard;
