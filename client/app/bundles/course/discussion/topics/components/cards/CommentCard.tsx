import { FC, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CheckCircleOutline } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Avatar,
  Button,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { grey, orange } from '@mui/material/colors';
import { CommentPostMiniEntity } from 'types/course/comments';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import Link from 'lib/components/core/Link';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import { deletePost, publishPost, updatePost } from '../../operations';

interface Props {
  post: CommentPostMiniEntity;
}

const translations = defineMessages({
  deleteConfirmation: {
    id: 'course.discussion.topics.CommentCard.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this comment?',
  },
  cancel: {
    id: 'course.discussion.topics.CommentCard.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course.discussion.topics.CommentCard.save',
    defaultMessage: 'Save',
  },
  publish: {
    id: 'course.discussion.topics.CommentCard.publish',
    defaultMessage: 'Publish',
  },
  isAiGenerated: {
    id: 'course.discussion.topics.CommentCard.isAiGenerated',
    defaultMessage: 'AI Generated Comment',
  },
  comment: {
    id: 'course.discussion.topics.CommentCard.comment',
    defaultMessage: 'Comment',
  },
  updateSuccess: {
    id: 'course.discussion.topics.CommentCard.updateSuccess',
    defaultMessage: 'Successfully updated comment.',
  },
  updateFailure: {
    id: 'course.discussion.topics.CommentCard.updateFailure',
    defaultMessage: 'Failed to update comment.',
  },
  deleteSuccess: {
    id: 'course.discussion.topics.CommentCard.deleteSuccess',
    defaultMessage: 'Successfully deleted comment.',
  },
  deleteFailure: {
    id: 'course.discussion.topics.CommentCard.deleteFailure',
    defaultMessage: 'Failed to delete comment.',
  },
  publishSuccess: {
    id: 'course.discussion.topics.CommentCard.publishSuccess',
    defaultMessage: 'Successfully published feedback.',
  },
  publishFailure: {
    id: 'course.discussion.topics.CommentCard.publishFailure',
    defaultMessage: 'Failed to publish feedback.',
  },
});

const CommentCard: FC<Props> = (props) => {
  const { post } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [editValue, setEditValue] = useState(post.text);
  const isDraft = post.workflowState === POST_WORKFLOW_STATE.draft;

  const editPostIdentifier = (field: string): string => {
    return `edit_post_${field}`;
  };

  const postIdentifier = (field: string): string => {
    return `post_${field}`;
  };

  const updateComment = (text: string): void => {
    dispatch(updatePost(post, text))
      .then(() => {
        setEditMode(false);
        toast.success(t(translations.updateSuccess));
      })
      .catch(() => {
        toast.error(t(translations.updateFailure));
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const publishComment = (text: string): void => {
    setIsSaving(true);
    dispatch(publishPost(post, text))
      .then(() => {
        setEditMode(false);
        toast.success(t(translations.publishSuccess));
      })
      .catch(() => {
        toast.error(t(translations.publishFailure));
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const onConfirmDelete = (): void => {
    setIsDeleting(true);
    dispatch(deletePost(post))
      .then(() => {
        toast.success(t(translations.deleteSuccess));
      })
      .catch(() => {
        toast.error(t(translations.deleteFailure));
      })
      .finally(() => {
        setDeleteConfirmation(false);
        setIsDeleting(false);
      });
  };

  const onSave = (): void => {
    setIsSaving(true);
    if (editValue.trim() === '') {
      toast.error('Cannot be empty');
      setIsSaving(false);
      return;
    }
    if (editValue === post.text) {
      setEditMode(false);
      setIsSaving(false);
    } else {
      updateComment(editValue);
    }
  };

  const toggleEditMode = (): void => {
    setEditMode(!editMode);
    setEditValue(post.text);
  };

  const renderCommentContent = (): JSX.Element => {
    if (editMode) {
      return (
        <div className="edit-discussion-post-form" id={`edit_post_${post.id}`}>
          <CKEditorRichText
            disabled={isSaving}
            inputId={editPostIdentifier(post.id.toString())}
            name={t(translations.comment)}
            onChange={(value): void => {
              setEditValue(value);
            }}
            value={editValue ?? ''}
          />
          <div
            style={{
              display: 'flex',
              marginRight: 5,
              marginBottom: 2,
            }}
          >
            <Button
              className="cancel-button"
              color="secondary"
              id={`post_${post.id}`}
              onClick={(): void => setEditMode(false)}
            >
              {t(translations.cancel)}
            </Button>
            <LoadingButton
              className="submit-button"
              color="primary"
              disabled={isDeleting || isSaving}
              id={`post_${post.id}`}
              loading={isSaving}
              onClick={isDraft ? (): void => publishComment(editValue) : onSave}
            >
              {isDraft ? t(translations.publish) : t(translations.save)}
            </LoadingButton>
          </div>
        </div>
      );
    }

    return (
      <Typography
        dangerouslySetInnerHTML={{ __html: post.text }}
        variant="body2"
      />
    );
  };

  const renderAuthorName = (): JSX.Element | string => {
    if (post.isAiGenerated && isDraft) {
      return t(translations.isAiGenerated);
    }

    if (post.creator.userUrl) {
      return (
        <Link to={post.creator.userUrl} underline="hover">
          {post.creator.name}
        </Link>
      );
    }

    return post.creator.name;
  };

  return (
    <div
      id={postIdentifier(post.id.toString())}
      style={{
        marginBottom: 10,
        borderStyle: 'solid',
        borderWidth: 0.2,
        borderColor: grey[400],
        borderRadius: '5px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: post.isDelayed || isDraft ? orange[100] : grey[100],
          borderRadius: '5px 5px 0px 0px',
        }}
      >
        <CardHeader
          avatar={
            post.isAiGenerated && isDraft ? null : (
              <Avatar
                alt={post.creator.name}
                className="wh-14"
                component={Link}
                src={post.creator.imageUrl}
                to={post.creator.userUrl}
                underline="none"
              />
            )
          }
          classes={{ avatar: 'mr-4' }}
          style={{ padding: 6 }}
          subheader={`${formatLongDateTime(post.createdAt)}${
            post.isDelayed ? ' (delayed comment)' : ''
          }`}
          subheaderTypographyProps={{ display: 'block' }}
          title={renderAuthorName()}
          titleTypographyProps={{
            display: 'block',
            fontSize: '1.5rem',
          }}
        />
        <div
          style={{
            display: 'flex',
            marginRight: 5,
            marginBottom: 2,
          }}
        >
          {isDraft && (
            <Tooltip title={t(translations.publish)}>
              <IconButton
                disabled={isSaving || isDeleting || editMode}
                onClick={() => publishComment(editValue)}
              >
                <CheckCircleOutline />
              </IconButton>
            </Tooltip>
          )}
          {post.canUpdate ? (
            <EditButton
              className="edit-comment"
              disabled={isSaving || isDeleting || editMode}
              id={`post_${post.id}`}
              onClick={toggleEditMode}
            />
          ) : null}
          {post.canDestroy ? (
            <DeleteButton
              className="delete-comment"
              disabled={isSaving || isDeleting}
              id={`post_${post.id}`}
              onClick={async (): Promise<void> => {
                setDeleteConfirmation(true);
              }}
            />
          ) : null}
        </div>
      </div>
      <div
        style={{
          wordWrap: 'break-word',
          padding: 7,
        }}
      >
        {renderCommentContent()}
      </div>
      <ConfirmationDialog
        confirmDelete
        disableCancelButton={isDeleting}
        disableConfirmButton={isDeleting}
        loadingConfirmButton={isDeleting}
        message={<FormattedMessage {...translations.deleteConfirmation} />}
        onCancel={(): void => setDeleteConfirmation(false)}
        onConfirm={onConfirmDelete}
        open={deleteConfirmation}
      />
    </div>
  );
};

export default CommentCard;
