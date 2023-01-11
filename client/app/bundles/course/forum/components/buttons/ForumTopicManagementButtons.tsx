import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MoreHoriz } from '@mui/icons-material';
import { ClickAwayListener, IconButton } from '@mui/material';
import { ForumTopicEntity } from 'types/course/forums';
import { AppDispatch } from 'types/store';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteForumTopic } from '../../operations';
import ForumTopicEdit from '../../pages/ForumTopicEdit';

import HideButton from './HideButton';
import LockButton from './LockButton';
import SubscribeButton from './SubscribeButton';

interface Props {
  topic: ForumTopicEntity;
  navigateToIndexAfterDelete?: boolean;
  navigateToShowAfterUpdate?: boolean;
  disabled?: boolean;
  showOnHover?: boolean;
  showSubscribeButton?: boolean;
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
  const {
    topic,
    navigateToIndexAfterDelete,
    navigateToShowAfterUpdate,
    disabled,
    showOnHover,
    showSubscribeButton,
  } = props;
  const dispatch = useDispatch<AppDispatch>();
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
        if (navigateToIndexAfterDelete) {
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
            } absolute right-0 top-0 flex h-full items-center border-0 pl-20 bg-fade-to-l-neutral-100`
          : 'whitespace-nowrap'
      }
    >
      {showSubscribeButton && (
        <SubscribeButton
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
        <HideButton disabled={disableButton} topic={topic} />
      )}
      {topic.permissions.canSetLockedTopic && (
        <LockButton disabled={disableButton} topic={topic} />
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
      <div className="group">
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
          navigateToShowAfterUpdate={navigateToShowAfterUpdate}
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
