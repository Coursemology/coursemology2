import { FC, memo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Paper, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { NotificationData } from 'types/course/notifications';

import NotificationCard from './NotificationCard';

interface Props extends WrappedComponentProps {
  notifications: NotificationData[];
}

const translations = defineMessages({
  latestActivityHeader: {
    id: 'course.courses.CourseNotifications.latestActivity',
    defaultMessage: 'Latest Activities',
  },
});

const CourseNotifications: FC<Props> = (props) => {
  const { intl, notifications } = props;

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <Typography variant="h6">
        {intl.formatMessage(translations.latestActivityHeader)}
      </Typography>

      <Paper className="p-3" variant="outlined">
        {notifications.map((notification, index) => (
          <NotificationCard
            // OK to use index since activity cannot be directly modified by anyone
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}_${notification.actableId}`}
            notification={notification}
          />
        ))}
      </Paper>
    </section>
  );
};

export default memo(injectIntl(CourseNotifications), (prevProps, nextProps) => {
  return equal(prevProps.notifications, nextProps.notifications);
});
