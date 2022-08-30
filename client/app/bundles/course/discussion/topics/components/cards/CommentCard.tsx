import { Avatar, Button, CardHeader, Link } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { grey, orange, red } from '@mui/material/colors';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import CKEditorRichText from 'lib/components/CKEditorRichText';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import moment from 'lib/moment';
import { FC, useState } from 'react';
import { CommentPostMiniEntity } from 'types/course/comments';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { toast } from 'react-toastify';
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
    id: 'course.discussion.topics.CommentCard.updateSuccess',
    defaultMessage: 'Failed to update comment.',
  },
  deleteSuccess: {
    id: 'course.discussion.topics.CommentCard.deleteSuccess',
    defaultMessage: 'Successfully deleted comment.',
  },
  deleteFailure: {
    id: 'course.discussion.topics.CommentCard.deleteSuccess',
    defaultMessage: 'Failed to delete comment.',
  },
});

const CommentCard: FC<Props> = (props) => {
  const { intl, post } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [editValue, setEditValue] = useState(post.text);

  const editPostIdentifier = (field: string): string => {
    return `edit_post_${field}`;
  };
  const formatDateTime = (dateTime: Date): string | null => {
    return dateTime ? moment(dateTime).format('MMM DD, YYYY h:mma') : null;
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
        setDeleteConfirmation(false);
        toast.success(intl.formatMessage(translations.deleteSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.deleteFailure));
      })
      .finally(() => {
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
        <div id={`edit_post_${post.id}`} className="edit-discussion-post-form">
          <CKEditorRichText
            disabled={isSaving}
            name={intl.formatMessage(translations.comment)}
            inputId={editPostIdentifier(post.id.toString())}
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
              color="secondary"
              onClick={(): void => setEditMode(false)}
              id={`post_${post.id}`}
              className="cancel-button"
            >
              <FormattedMessage {...translations.cancel} />
            </Button>
            <LoadingButton
              color="primary"
              onClick={onSave}
              disabled={isDeleting || isSaving}
              loading={isSaving}
              id={`post_${post.id}`}
              className="submit-button"
            >
              <FormattedMessage {...translations.save} />
            </LoadingButton>
          </div>
        </div>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: post.text }} />;
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
              src={post.creator.imageUrl}
              alt={post.creator.name}
              style={{ height: '25px', width: '25px' }}
              component={Link}
              href={post.creator.userUrl}
            />
          }
          title={
            post.creator.userUrl ? (
              <a href={post.creator.userUrl}>{post.creator.name}</a>
            ) : (
              post.creator.name
            )
          }
          titleTypographyProps={{ display: 'block', marginright: 20 }}
          subheader={`${formatDateTime(post.createdAt)}${
            post.isDelayed ? ' (delayed comment)' : ''
          }`}
          subheaderTypographyProps={{ display: 'block' }}
          style={{ padding: 6 }}
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
        open={deleteConfirmation}
        message={<FormattedMessage {...translations.deleteConfirmation} />}
        onCancel={(): void => setDeleteConfirmation(false)}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default injectIntl(CommentCard);
