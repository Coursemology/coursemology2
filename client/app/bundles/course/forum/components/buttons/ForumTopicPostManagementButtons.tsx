import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ForumTopicPostEntity } from 'types/course/forums';
import { AppDispatch } from 'types/store';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteForumTopicPost } from '../../operations';

import ReplyButton from './ReplyButton';

interface Props {
  post: ForumTopicPostEntity;
  handleEdit: () => void;
  handleReply: () => void;
  disabled?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.forum.components.buttons.forumTopicPostManagement.delete.success',
    defaultMessage: 'The post has been deleted.',
  },
  deletionFailure: {
    id: 'course.forum.components.buttons.forumTopicPostManagement.delete.fail',
    defaultMessage: 'Failed to delete topic - {error}',
  },
  deletionConfirm: {
    id: 'course.forum.components.buttons.forumTopicPostManagement.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete this topic post?',
  },
});

const ForumTopicPostManagementButtons: FC<Props> = (props) => {
  const { post, handleEdit, handleReply, disabled } = props;
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forumId } = useParams();

  const [isDeleting, setIsDeleting] = useState(false);
  const disableButton = isDeleting || !!disabled;

  const handleDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteForumTopicPost(post.postUrl, post.id))
      .then((response) => {
        toast.success(t(translations.deletionSuccess));
        if (response.isTopicDeleted) {
          navigate(`/courses/${getCourseId()}/forums/${forumId}`);
        } else {
          setIsDeleting(false);
        }
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  return (
    <div className="whitespace-nowrap">
      {post.parentId === null && post.permissions.canReplyPost && (
        <ReplyButton
          className={`post-reply-${post.id}`}
          handleClick={handleReply}
        />
      )}
      {post.permissions.canEditPost && (
        <EditButton
          className={`post-edit-${post.id}`}
          disabled={disableButton}
          onClick={handleEdit}
        />
      )}
      {post.permissions.canDeletePost && (
        <DeleteButton
          className={`post-delete-${post.id}`}
          confirmMessage={t(translations.deletionConfirm)}
          disabled={disableButton}
          loading={isDeleting}
          onClick={handleDelete}
        />
      )}
    </div>
  );
};

export default ForumTopicPostManagementButtons;
