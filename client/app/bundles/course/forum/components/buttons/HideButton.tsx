import { FC, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { toast } from 'react-toastify';
import { ForumTopicEntity } from 'types/course/forums';
import { defineMessages } from 'react-intl';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import useTranslation from 'lib/hooks/useTranslation';
import { updateForumTopicHidden } from '../../operations';

const translations = defineMessages({
  hide: {
    id: 'course.forum.components.buttons.hideButton.hide',
    defaultMessage: 'Hide',
  },
  unhide: {
    id: 'course.forum.components.buttons.hideButton.unhide',
    defaultMessage: 'Unhide',
  },
  hideSuccess: {
    id: 'course.forum.components.buttons.hideButton.hideSuccess',
    defaultMessage: 'The topic "{title}" has successfully been hidden.',
  },
  hideFailure: {
    id: 'course.forum.components.buttons.hideButton.hideFailure',
    defaultMessage: 'Failed to hide the topic "{title}" - {error}',
  },
  unhideSuccess: {
    id: 'course.forum.components.buttons.hideButton.unhideSuccess',
    defaultMessage: 'The topic "{title}" has successfully been unhidden.',
  },
  unhideFailure: {
    id: 'course.forum.components.buttons.hideButton.unhideFailure',
    defaultMessage: 'Failed to unhide the topic "{title}" - {error}',
  },
});

interface Props {
  topic: ForumTopicEntity;
  disabled?: boolean;
}

const HideButton: FC<Props> = ({ topic, disabled: disableButton }: Props) => {
  const [isHiding, setIsHiding] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const disabled = isHiding || disableButton;

  const handleHide = (): Promise<void> => {
    setIsHiding(true);
    return dispatch(
      updateForumTopicHidden(topic.id, topic.topicUrl, topic.isHidden),
    )
      .then(() => {
        toast.success(
          topic.isHidden
            ? t(translations.unhideSuccess, {
                title: topic.title,
              })
            : t(translations.hideSuccess, {
                title: topic.title,
              }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          topic.isHidden
            ? t(translations.hideFailure, {
                title: topic.title,
                error: errorMessage,
              })
            : t(translations.unhideFailure, {
                title: topic.title,
                error: errorMessage,
              }),
        );
      })
      .finally(() => setIsHiding(false));
  };

  return (
    <Tooltip
      title={topic.isHidden ? t(translations.unhide) : t(translations.hide)}
    >
      <span>
        <IconButton
          className={`topic-hide-${topic.id}`}
          color="inherit"
          disabled={disabled}
          onClick={handleHide}
        >
          {topic.isHidden ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default HideButton;
