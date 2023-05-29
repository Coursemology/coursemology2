import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Stack, Typography } from '@mui/material';
import { AnnouncementEntity } from 'types/course/announcements';

import AnnouncementCard from '../../../announcements/components/misc/AnnouncementCard';

interface Props extends WrappedComponentProps {
  announcements: AnnouncementEntity[];
}

const translations = defineMessages({
  announcementHeader: {
    id: 'course.courses.CourseAnnouncements.announcementHeader',
    defaultMessage: 'Latest announcements',
  },
});

const CourseAnnouncements: FC<Props> = (props) => {
  const { intl, announcements } = props;

  return (
    <section className="space-y-2">
      <Typography variant="h6">
        {intl.formatMessage(translations.announcementHeader)}
      </Typography>

      {announcements && (
        <Stack spacing={1}>
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              showEditOptions={false}
            />
          ))}
        </Stack>
      )}
    </section>
  );
};

export default injectIntl(CourseAnnouncements);
