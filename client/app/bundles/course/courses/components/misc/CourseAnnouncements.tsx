import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Typography } from '@mui/material';
import { AnnouncementEntity } from 'types/course/announcements';

import AnnouncementsDisplay from 'course/announcements/components/misc/AnnouncementsDisplay';

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
        <AnnouncementsDisplay
          announcementPermissions={{ canCreate: false }}
          announcements={announcements}
        />
      )}
    </section>
  );
};

export default injectIntl(CourseAnnouncements);
