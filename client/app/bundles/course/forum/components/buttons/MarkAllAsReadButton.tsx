import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  nextUnreadTopicUrl?: string | null;
  handleMarkAllAsRead: () => void;
  className?: string;
  disabled?: boolean;
}

const translations = defineMessages({
  markAllAsRead: {
    id: 'course.forum.MarkAllAsReadButton.markAllAsRead',
    defaultMessage: 'Mark all as read',
  },
  AllReadTooltip: {
    id: 'course.forum.MarkAllAsReadButton.AllReadTooltip',
    defaultMessage: 'Hooray! All topics have been read!',
  },
  markAllAsReadTooltip: {
    id: 'course.forum.MarkAllAsReadButton.markAllAsReadTooltip',
    defaultMessage: 'Mark all forum posts on the current page as read',
  },
});

const MarkAllAsReadButton: FC<Props> = ({
  nextUnreadTopicUrl,
  handleMarkAllAsRead,
  className,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={
        nextUnreadTopicUrl
          ? t(translations.markAllAsReadTooltip)
          : t(translations.AllReadTooltip)
      }
    >
      <span>
        <Button
          key="mark-all-as-read-button"
          className={`mark-all-as-read-button ${className ?? ''}`}
          color="inherit"
          disabled={!nextUnreadTopicUrl || disabled}
          onClick={handleMarkAllAsRead}
        >
          {t(translations.markAllAsRead)}
        </Button>
      </span>
    </Tooltip>
  );
};

export default MarkAllAsReadButton;
