import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { CampaignOutlined, Close } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import produce from 'immer';
import { AnnouncementMiniEntity } from 'types/course/announcements';

import GlobalAPI from 'api';
import useTranslation from 'lib/hooks/useTranslation';
import { formatFullDateTime } from 'lib/moment';

const translations = defineMessages({
  nUnreadAnnouncements: {
    id: 'course.announcements.GlobalAnnouncements.nUnreadAnnouncements',
    defaultMessage:
      '{n} more unread {n, plural, one {announcement} other {announcements}}',
  },
});

interface GlobalAnnouncementsProps {
  in: AnnouncementMiniEntity[];
}

const GlobalAnnouncements = (
  props: GlobalAnnouncementsProps,
): JSX.Element | null => {
  const [announcements, setAnnouncements] = useState(props.in);

  const { t } = useTranslation();

  const latestAnnouncement = announcements[0];
  if (!latestAnnouncement) return null;

  const markAsRead = async (index: number): Promise<void> => {
    const announcement = announcements[index];

    try {
      await GlobalAPI.announcements.markAsRead(announcement.markAsReadUrl);
    } catch {
      /* empty */
    } finally {
      setAnnouncements(
        produce((draft) => {
          draft.splice(index, 1);
        }),
      );
    }
  };

  return (
    <>
      <div className="flex items-start space-x-4 px-5 py-3 border-only-b-neutral-200">
        <CampaignOutlined />

        <div className="w-full">
          <Typography className="font-medium" variant="body2">
            {latestAnnouncement.title}
          </Typography>

          <Typography color="text.secondary" variant="caption">
            {formatFullDateTime(latestAnnouncement.startTime)}
          </Typography>

          <Typography
            className="mt-2"
            dangerouslySetInnerHTML={{
              __html: latestAnnouncement.content,
            }}
            variant="body2"
          />
        </div>

        <IconButton onClick={(): Promise<void> => markAsRead(0)} size="small">
          <Close />
        </IconButton>
      </div>

      {announcements.length > 1 && (
        <div className="flex items-center space-x-4 px-5 py-1 border-only-b-neutral-200">
          <CampaignOutlined />

          <Typography variant="body2">
            {t(translations.nUnreadAnnouncements, {
              n: announcements.length - 1,
            })}
          </Typography>
        </div>
      )}
    </>
  );
};

export default GlobalAnnouncements;
