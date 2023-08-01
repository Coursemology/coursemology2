import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { CourseEntity } from 'types/course/courses';

import AvatarWithLabel from 'lib/components/core/AvatarWithLabel';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import CourseAnnouncements from '../../components/misc/CourseAnnouncements';
import CourseEnrolOptions from '../../components/misc/CourseEnrolOptions';
import CourseNotifications from '../../components/misc/CourseNotifications';
import PendingTodosTable from '../../components/tables/PendingTodosTable';
import { loadCourse } from '../../operations';
import { getCourseEntity } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchCourseFailure: {
    id: 'course.courses.CourseShow.fetchCourseFailure',
    defaultMessage: 'Failed to fetch information of the course.',
  },
  descriptionHeader: {
    id: 'course.courses.CourseShow.descriptionHeader',
    defaultMessage: 'Description',
  },
  instructorsHeader: {
    id: 'course.courses.CourseShow.instructorsHeader',
    defaultMessage: 'Instructors',
  },
});

const getShouldShowEnrolOptions = (course: CourseEntity): boolean => {
  const info = course.registrationInfo;
  if (!info) return false;

  return info.isDisplayCodeForm || info.isEnrollable;
};

const CourseShow: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { courseId } = useParams();
  const course = useAppSelector((state) => getCourseEntity(state, +courseId!));

  useEffect(() => {
    if (courseId) {
      dispatch(loadCourse(+courseId))
        .finally(() => setIsLoading(false))
        .catch(() =>
          toast.error(intl.formatMessage(translations.fetchCourseFailure)),
        );
    }
  }, [dispatch, courseId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!course) {
    return null;
  }

  return (
    <Page className="space-y-5">
      {!course.permissions.isCurrentCourseUser && (
        <>
          {getShouldShowEnrolOptions(course) && (
            <div className="flex justify-end">
              <CourseEnrolOptions registrationInfo={course.registrationInfo!} />
            </div>
          )}

          {course.description.trim() && (
            <section className="space-y-2">
              <Typography variant="h6">
                {intl.formatMessage(translations.descriptionHeader)}
              </Typography>

              <Typography
                dangerouslySetInnerHTML={{ __html: course.description }}
                id="course-description"
                variant="body2"
              />
            </section>
          )}

          <section className="space-y-2">
            <Typography variant="h6">
              {intl.formatMessage(translations.instructorsHeader)}
            </Typography>

            <div className="-m-4 flex flex-wrap">
              {course.instructors?.map((instructor) => (
                <div
                  key={instructor.id}
                  className="m-4 w-32 space-y-4"
                  id={`instructor-${instructor.id}`}
                >
                  <AvatarWithLabel
                    imageUrl={instructor.imageUrl!}
                    label={instructor.name}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {(course.permissions.isCurrentCourseUser ||
        course.permissions.canManage) && (
        <>
          {Boolean(course.currentlyActiveAnnouncements?.length) && (
            <CourseAnnouncements
              announcements={course.currentlyActiveAnnouncements}
            />
          )}

          {course.assessmentTodos && (
            <PendingTodosTable
              todos={course.assessmentTodos}
              todoType="assessments"
            />
          )}

          {course.videoTodos && (
            <PendingTodosTable todos={course.videoTodos} todoType="videos" />
          )}

          {course.surveyTodos && (
            <PendingTodosTable todos={course.surveyTodos} todoType="surveys" />
          )}

          <CourseNotifications notifications={course.notifications} />
        </>
      )}
    </Page>
  );
};

export default injectIntl(CourseShow);
