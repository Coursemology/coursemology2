import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Stack } from '@mui/material';
import { AnnouncementEntity } from 'types/course/announcements';

import AnnouncementCard from '../../../announcements/components/misc/AnnouncementCard';

interface Props extends WrappedComponentProps {
  announcements: AnnouncementEntity[];
}

const translations = defineMessages({
  announcementHeader: {
    id: 'course.courses.CourseAnnouncements.announcementHeader',
    defaultMessage: 'Announcements',
  },
  noAnnouncements: {
    id: 'course.courses.CourseAnnouncements.noAnnouncements',
    defaultMessage: 'There are currently no announcements',
  },
});

const CourseAnnouncements: FC<Props> = (props) => {
  const { intl, announcements } = props;

  return (
    <>
      <h2>{intl.formatMessage(translations.announcementHeader)}</h2>

      {announcements === null && (
        <>{intl.formatMessage(translations.noAnnouncements)}</>
      )}

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
    </>
  );
};

export default injectIntl(CourseAnnouncements);
