import { FC, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { toast } from 'react-toastify';
import { ForumTopicEntity } from 'types/course/forums';
import { defineMessages } from 'react-intl';
import { LockOpen, Lock } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import useTranslation from 'lib/hooks/useTranslation';
import { updateForumTopicLocked } from '../../operations';

const translations = defineMessages({
  locked: {
    id: 'course.forum.components.buttons.lockedButton.locked',
    defaultMessage: 'Lock',
  },
  unlocked: {
    id: 'course.forum.components.buttons.lockedButton.unlocked',
    defaultMessage: 'Unlock',
  },
  lockedSuccess: {
    id: 'course.forum.components.buttons.lockedButton.lockedSuccess',
    defaultMessage: 'The topic "{title}" has successfully been locked.',
  },
  lockedFailure: {
    id: 'course.forum.components.buttons.lockedButton.lockedFailure',
    defaultMessage: 'Failed to locked the topic "{title}" - {error}',
  },
  unlockedSuccess: {
    id: 'course.forum.components.buttons.lockedButton.unlockedSuccess',
    defaultMessage: 'The topic "{title}" has successfully been unlocked.',
  },
  unlockedFailure: {
    id: 'course.forum.components.buttons.lockedButton.unlockedFailure',
    defaultMessage: 'Failed to unlocked the topic "{title}" - {error}',
  },
});

interface Props {
  topic: ForumTopicEntity;
  disabled?: boolean;
}

const LockButton: FC<Props> = ({ topic, disabled: disableButton }: Props) => {
  const [isLocking, setIsLocking] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const disabled = isLocking || disableButton;

  const handleLock = (): Promise<void> => {
    setIsLocking(true);
    return dispatch(
      updateForumTopicLocked(topic.id, topic.topicUrl, topic.isLocked),
    )
      .then(() => {
        toast.success(
          topic.isLocked
            ? t(translations.unlockedSuccess, {
                title: topic.title,
              })
            : t(translations.lockedSuccess, {
                title: topic.title,
              }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          topic.isLocked
            ? t(translations.lockedFailure, {
                title: topic.title,
                error: errorMessage,
              })
            : t(translations.unlockedFailure, {
                title: topic.title,
                error: errorMessage,
              }),
        );
      })
      .finally(() => setIsLocking(false));
  };

  return (
    <Tooltip
      title={topic.isLocked ? t(translations.unlocked) : t(translations.locked)}
    >
      <span>
        <IconButton
          className={`topic-lock-${topic.id}`}
          color="inherit"
          disabled={disabled}
          onClick={handleLock}
        >
          {topic.isLocked ? <LockOpen /> : <Lock />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default LockButton;
