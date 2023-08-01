import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreHoriz } from '@mui/icons-material';
import { ClickAwayListener, IconButton } from '@mui/material';
import { ForumTopicEntity } from 'types/course/forums';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteForumTopic } from '../../operations';
import ForumTopicEdit from '../../pages/ForumTopicEdit';

import HideButton from './HideButton';
import LockButton from './LockButton';
import SubscribeButton from './SubscribeButton';

interface Props {
  topic: ForumTopicEntity;
  disabled?: boolean;
  pageType: 'TopicShow' | 'TopicIndex';
  showOnHover?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.forum.ForumTopicManagementButtons.deletionSuccess',
    defaultMessage: 'Topic {title} was deleted.',
  },
  deletionFailure: {
    id: 'course.forum.ForumTopicManagementButtons.deletionFailure',
    defaultMessage: 'Failed to delete topic - {error}',
  },
  deletionConfirm: {
    id: 'course.forum.ForumTopicManagementButtons.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete this topic "{title}"?',
  },
});

const ForumTopicManagementButtons: FC<Props> = (props) => {
  const { topic, pageType, disabled, showOnHover } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forumId } = useParams();

  const [showButtons, setShowButtons] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const disableButton = isDeleting || !!disabled;
  const handleEdit = (): void => {
    setIsEditOpen(true);
  };

  const handleDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteForumTopic(topic.topicUrl, topic.id))
      .then(() => {
        toast.success(
          t(translations.deletionSuccess, {
            title: topic.title,
          }),
        );
        if (pageType === 'TopicShow') {
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

  const managementButtons = (
    <div
      className={
        showOnHover
          ? `${
              showButtons ? '' : 'invisible group-hover:visible'
            } absolute right-0 top-0 flex h-full items-center space-x-2 border-0 pl-20  bg-fade-to-l-neutral-100`
          : 'space-x-2 whitespace-nowrap'
      }
    >
      {pageType === 'TopicShow' && (
        <SubscribeButton
          className="max-lg:!hidden"
          disabled={disableButton}
          emailSubscription={topic.emailSubscription}
          entityId={topic.id}
          entityTitle={topic.title}
          entityType="topic"
          entityUrl={topic.topicUrl}
          type="button"
        />
      )}
      {topic.permissions.canSetHiddenTopic && (
        <HideButton
          className={pageType === 'TopicShow' ? 'max-lg:!hidden' : ''}
          disabled={disableButton}
          topic={topic}
        />
      )}
      {topic.permissions.canSetLockedTopic && (
        <LockButton
          className={pageType === 'TopicShow' ? 'max-lg:!hidden' : ''}
          disabled={disableButton}
          topic={topic}
        />
      )}
      {topic.permissions.canEditTopic && (
        <EditButton
          className={`topic-edit-${topic.id}`}
          disabled={disableButton}
          onClick={handleEdit}
        />
      )}
      {topic.permissions.canDeleteTopic && (
        <DeleteButton
          className={`topic-delete-${topic.id}`}
          confirmMessage={t(translations.deletionConfirm, {
            title: topic.title,
          })}
          disabled={disableButton}
          loading={isDeleting}
          onClick={handleDelete}
        />
      )}
    </div>
  );

  return (
    <ClickAwayListener onClickAway={(): void => setShowButtons(false)}>
      <div className="group relative">
        {showOnHover && (
          <IconButton
            className={`topic-action-${topic.id}`}
            color="inherit"
            onClick={(): void => setShowButtons((prevState) => !prevState)}
          >
            <MoreHoriz />
          </IconButton>
        )}
        {managementButtons}
        <ForumTopicEdit
          isOpen={isEditOpen}
          navigateToShowAfterUpdate={pageType === 'TopicShow'}
          onClose={(): void => {
            setIsEditOpen(false);
          }}
          topic={topic}
        />
      </div>
    </ClickAwayListener>
  );
};

export default ForumTopicManagementButtons;
