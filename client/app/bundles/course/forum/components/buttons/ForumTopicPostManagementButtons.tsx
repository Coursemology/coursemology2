import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { ForumTopicPostEntity } from 'types/course/forums';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteForumTopicPost } from '../../operations';

import ReplyButton from './ReplyButton';

interface Props {
  post: ForumTopicPostEntity;
  topicId: number;
  handleEdit: () => void;
  handleReply: () => void;
  isEditing: boolean;
  disabled?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.forum.ForumTopicPostManagementButtons.deletionSuccess',
    defaultMessage: 'The post has been deleted.',
  },
  deletionFailure: {
    id: 'course.forum.ForumTopicPostManagementButtons.deletionFailure',
    defaultMessage: 'Failed to delete topic - {error}',
  },
  deletionConfirm: {
    id: 'course.forum.ForumTopicPostManagementButtons.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete this topic post?',
  },
});

const ForumTopicPostManagementButtons: FC<Props> = (props) => {
  const { post, topicId, handleEdit, handleReply, isEditing, disabled } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forumId } = useParams();

  const [isDeleting, setIsDeleting] = useState(false);
  const disableButton = isDeleting || !!disabled;

  const handleDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteForumTopicPost(post.postUrl, post.id, topicId))
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
          disabled={disableButton}
          handleClick={handleReply}
        />
      )}

      {post.permissions.canEditPost && (
        <EditButton
          className={`post-edit-${post.id}`}
          disabled={disableButton || isEditing}
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
