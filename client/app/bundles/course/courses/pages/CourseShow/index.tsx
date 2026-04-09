import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { CourseEntity } from 'types/course/courses';

import AvatarWithLabel from 'lib/components/core/AvatarWithLabel';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import courseTranslations from 'lib/translations/course';

import CourseAnnouncements from '../../components/misc/CourseAnnouncements';
import CourseEnrolOptions from '../../components/misc/CourseEnrolOptions';
import CourseNotifications from '../../components/misc/CourseNotifications';
import CourseSuspendedAlert from '../../components/misc/CourseSuspendedAlert';
import PendingTodosTable from '../../components/tables/PendingTodosTable';
import { loadCourse } from '../../operations';
import { getCourseEntity } from '../../selectors';

const translations = defineMessages({
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

const CourseShow: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = useAppSelector((state) => getCourseEntity(state, +courseId!));

  useEffect(() => {
    if (courseId) {
      dispatch(loadCourse(+courseId))
        .then(({ course: courseResponse }) => {
          if (courseResponse.isSuspendedUser) {
            navigate(
              `/suspended?from=${encodeURIComponent(window.location.href)}`,
              { replace: true },
            );
          }
        })
        .finally(() => setIsLoading(false))
        .catch(() => toast.error(t(courseTranslations.fetchCourseFailure)));
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
      {course.isSuspended && (
        <CourseSuspendedAlert
          canSuspendCourse={course.canSuspendCourse}
          linkToSettings
        />
      )}
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
                {t(translations.descriptionHeader)}
              </Typography>

              <UserHTMLText
                html={course.description}
                id="course-description"
                variant="body2"
              />
            </section>
          )}

          <section className="space-y-2">
            <Typography variant="h6">
              {t(translations.instructorsHeader)}
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

export default CourseShow;
