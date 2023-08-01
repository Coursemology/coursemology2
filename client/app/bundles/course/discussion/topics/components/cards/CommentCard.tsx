import { FC, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { LoadingButton } from '@mui/lab';
import { Avatar, Button, CardHeader, Typography } from '@mui/material';
import { grey, orange, red } from '@mui/material/colors';
import { CommentPostMiniEntity } from 'types/course/comments';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import Link from 'lib/components/core/Link';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import { formatLongDateTime } from 'lib/moment';

import { deletePost, updatePost } from '../../operations';

interface Props extends WrappedComponentProps {
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
});

const CommentCard: FC<Props> = (props) => {
  const { intl, post } = props;
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [editValue, setEditValue] = useState(post.text);

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
        toast.success(intl.formatMessage(translations.updateSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.updateFailure));
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const onConfirmDelete = (): void => {
    setIsDeleting(true);
    dispatch(deletePost(post))
      .then(() => {
        toast.success(intl.formatMessage(translations.deleteSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.deleteFailure));
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
            name={intl.formatMessage(translations.comment)}
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
              <FormattedMessage {...translations.cancel} />
            </Button>
            <LoadingButton
              className="submit-button"
              color="primary"
              disabled={isDeleting || isSaving}
              id={`post_${post.id}`}
              loading={isSaving}
              onClick={onSave}
            >
              <FormattedMessage {...translations.save} />
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
          backgroundColor: post.isDelayed ? orange[100] : grey[100],
          borderRadius: '5px 5px 0px 0px',
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              alt={post.creator.name}
              className="wh-14"
              component={Link}
              src={post.creator.imageUrl}
              to={post.creator.userUrl}
              underline="none"
            />
          }
          classes={{ avatar: 'mr-4' }}
          style={{ padding: 6 }}
          subheader={`${formatLongDateTime(post.createdAt)}${
            post.isDelayed ? ' (delayed comment)' : ''
          }`}
          subheaderTypographyProps={{ display: 'block' }}
          title={
            post.creator.userUrl ? (
              <Link to={post.creator.userUrl} underline="hover">
                {post.creator.name}
              </Link>
            ) : (
              post.creator.name
            )
          }
          titleTypographyProps={{ display: 'block', marginright: 20 }}
        />
        <div
          style={{
            display: 'flex',
            marginRight: 5,
            marginBottom: 2,
          }}
        >
          {post.canUpdate ? (
            <Button
              className="edit-comment"
              id={`post_${post.id}`}
              onClick={toggleEditMode}
              style={{
                height: 35,
                width: 40,
                minWidth: 40,
              }}
            >
              <Edit htmlColor="black" />
            </Button>
          ) : null}
          {post.canDestroy ? (
            <Button
              className="delete-comment"
              disabled={isDeleting}
              id={`post_${post.id}`}
              onClick={(): void => setDeleteConfirmation(true)}
              style={{
                height: 35,
                width: 40,
                minWidth: 40,
              }}
            >
              <Delete htmlColor={red[500]} />
            </Button>
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

export default injectIntl(CommentCard);
