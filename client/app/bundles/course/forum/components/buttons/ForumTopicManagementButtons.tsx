import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ForumTopicEntity } from 'types/course/forums';
import { AppDispatch } from 'types/store';
import { MoreHoriz } from '@mui/icons-material';
import { ClickAwayListener, IconButton } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import colors from 'tailwindcss/colors';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import SubscribeButton from './SubscribeButton';
import TopicEdit from '../../pages/ForumTopicEdit';
import { deleteForumTopic } from '../../operations';
import HideButton from './HideButton';
import LockButton from './LockButton';

interface Props {
  topic: ForumTopicEntity;
  navigateToIndexAfterDelete?: boolean;
  navigateToShowAfterUpdate?: boolean;
  disabled?: boolean;
  showOnHover?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.forum.components.buttons.forumTopicManagement.delete.success',
    defaultMessage: 'Topic {title} was deleted.',
  },
  deletionFailure: {
    id: 'course.forum.components.buttons.forumTopicManagement.delete.fail',
    defaultMessage: 'Failed to delete topic - {error}',
  },
  deletionConfirm: {
    id: 'course.forum.components.buttons.forumTopicManagement.delete.confirm',
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
            } absolute right-0 top-0 flex h-full items-center border-0 pl-20`
          : ''
      }
      style={
        showOnHover || showButtons
          ? {
              background: `linear-gradient(90deg, transparent 0%, ${colors.neutral[100]} 20%)`,
            }
          : {}
      }
    >
      <SubscribeButton
        emailSubscription={topic.emailSubscription}
        entityType="topic"
        entityId={topic.id}
        entityUrl={topic.topicUrl}
        entityTitle={topic.title}
        disabled={disableButton}
      />
      {topic.permissions.canSetHiddenTopic && (
        <HideButton topic={topic} disabled={disableButton} />
      )}
      {topic.permissions.canSetLockedTopic && (
        <LockButton topic={topic} disabled={disableButton} />
      )}
      {topic.permissions.canEditTopic && (
        <EditButton
          className={`topic-edit-${topic.id}`}
          onClick={handleEdit}
          disabled={disableButton}
        />
      )}
      {topic.permissions.canDeleteTopic && (
        <DeleteButton
          className={`topic-delete-${topic.id}`}
          disabled={disableButton}
          loading={isDeleting}
          onClick={handleDelete}
          confirmMessage={t(translations.deletionConfirm, {
            title: topic.title,
          })}
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
        <TopicEdit
          topic={topic}
          isOpen={isEditOpen}
          handleClose={(): void => {
            setIsEditOpen(false);
          }}
          navigateToShowAfterUpdate={navigateToShowAfterUpdate}
        />
      </div>
    </ClickAwayListener>
  );
};

export default ForumTopicManagementButtons;
