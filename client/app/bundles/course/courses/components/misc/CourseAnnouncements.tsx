import { injectIntl, defineMessages, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { AnnouncementMiniEntity } from 'types/course/announcements';
import { Stack } from '@mui/material';
import AnnouncementCard from '../../../announcements/components/AnnouncementCard';

interface Props extends WrappedComponentProps {
  announcements: AnnouncementMiniEntity[];
}

const translations = defineMessages({
  announcementHeader: {
    id: 'course.courses.show.announcements',
    defaultMessage: 'Announcements',
  },
  noAnnouncements: {
    id: 'course.courses.show.noAnnouncements',
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
