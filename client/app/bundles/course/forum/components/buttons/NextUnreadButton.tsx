import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Tooltip } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  nextUnreadTopicUrl: string | null;
  disabled: boolean;
}

const translations = defineMessages({
  nextUnreadTooltip: {
    id: 'course.forum.NextUnreadButton.nextUnreadTooltip',
    defaultMessage: 'Jump to next unread topic',
  },
  AllReadTooltip: {
    id: 'course.forum.NextUnreadButton.AllReadTooltip',
    defaultMessage: 'Hooray! All topics have been read!',
  },
  nextUnread: {
    id: 'course.forum.NextUnreadButton.nextUnread',
    defaultMessage: 'Next Unread',
  },
});

const NextUnreadButton: FC<Props> = ({ nextUnreadTopicUrl, disabled }) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      key="next-unread-tooltip"
      title={
        nextUnreadTopicUrl
          ? t(translations.nextUnreadTooltip)
          : t(translations.AllReadTooltip)
      }
    >
      <span>
        <Button
          className="next-unread-button text-center"
          color="inherit"
          component={Link}
          disabled={!nextUnreadTopicUrl || disabled}
          to={nextUnreadTopicUrl ?? '#'}
        >
          {t(translations.nextUnread)}
        </Button>
      </span>
    </Tooltip>
  );
};

export default NextUnreadButton;
