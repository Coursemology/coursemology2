import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Tooltip } from '@mui/material';
import { ForumTopicEntity } from 'types/course/forums';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateForumTopicHidden } from '../../operations';

const translations = defineMessages({
  hide: {
    id: 'course.forum.HideButton.hide',
    defaultMessage: 'Hide',
  },
  unhide: {
    id: 'course.forum.HideButton.unhide',
    defaultMessage: 'Unhide',
  },
  hideTooltip: {
    id: 'course.forum.HideButton.hideTooltip',
    defaultMessage: 'Hide topic from students',
  },
  unhideTooltip: {
    id: 'course.forum.HideButton.unhideTooltip',
    defaultMessage: 'Show topic to students',
  },
  hideSuccess: {
    id: 'course.forum.HideButton.hideSuccess',
    defaultMessage: 'The topic "{title}" has successfully been hidden.',
  },
  hideFailure: {
    id: 'course.forum.HideButton.hideFailure',
    defaultMessage: 'Failed to hide the topic "{title}" - {error}',
  },
  unhideSuccess: {
    id: 'course.forum.HideButton.unhideSuccess',
    defaultMessage: 'The topic "{title}" has successfully been unhidden.',
  },
  unhideFailure: {
    id: 'course.forum.HideButton.unhideFailure',
    defaultMessage: 'Failed to unhide the topic "{title}" - {error}',
  },
});

interface Props {
  topic: ForumTopicEntity;
  className?: string;
  disabled?: boolean;
}

const HideButton: FC<Props> = ({
  topic,
  disabled: disableButton,
  className,
}: Props) => {
  const [isHiding, setIsHiding] = useState(false);
  const dispatch = useAppDispatch();
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
      title={
        topic.isHidden
          ? t(translations.unhideTooltip)
          : t(translations.hideTooltip)
      }
    >
      <Button
        className={`topic-hide-${topic.id}  ${className ?? ''}`}
        color="inherit"
        disabled={disabled}
        onClick={handleHide}
        variant="outlined"
      >
        {topic.isHidden ? t(translations.unhide) : t(translations.hide)}
      </Button>
    </Tooltip>
  );
};

export default HideButton;
