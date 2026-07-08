import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Typography } from '@mui/material';

import { getComponentTitle } from 'course/translations';
import Link from 'lib/components/core/Link';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  header: {
    id: 'course.courses.CourseSuspendedAlert.header',
    defaultMessage:
      'This course is suspended. Instructors can still access it, but students cannot.',
  },
  canSuspendMessage: {
    id: 'course.courses.CourseSuspendedAlert.canSuspendMessage',
    defaultMessage: 'You can unsuspend it from the {link} page.',
  },
  cannotSuspendMessage: {
    id: 'course.courses.CourseSuspendedAlert.cannotSuspendMessage',
    defaultMessage:
      'If you believe this is a mistake, contact a course manager or owner to have them unsuspend the course.',
  },
});

const CourseSuspendedAlert: FC<{
  canSuspendCourse: boolean;
  linkToSettings?: boolean;
}> = ({ canSuspendCourse, linkToSettings }) => {
  const { t } = useTranslation();
  return (
    <Alert severity="warning">
      <Typography variant="body2">{t(translations.header)}</Typography>
      {canSuspendCourse && linkToSettings && (
        <Typography variant="body2">
          {t(translations.canSuspendMessage, {
            link: (
              <Link
                opensInNewTab
                to={`/courses/${getCourseId()}/admin`}
                underline="hover"
              >
                {getComponentTitle(t, 'admin_settings')}
              </Link>
            ),
          })}
        </Typography>
      )}
      {!canSuspendCourse && (
        <Typography variant="body2">
          {t(translations.cannotSuspendMessage)}
        </Typography>
      )}
    </Alert>
  );
};

export default CourseSuspendedAlert;
