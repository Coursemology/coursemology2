import { FC, useState, useEffect } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Grid } from '@mui/material';
import AvatarWithLabel from 'lib/components/AvatarWithLabel';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { AppDispatch, AppState } from 'types/store';
import CourseAnnouncements from '../../components/misc/CourseAnnouncements';
import PendingTodosTable from '../../components/tables/PendingTodosTable';
import CourseNotifications from '../../components/misc/CourseNotifications';
import CourseEnrollOptions from '../../components/misc/CourseEnrollOptions';
import { loadCourse } from '../../operations';
import { getCourseEntity } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchCourseFailure: {
    id: 'course.courses.show.fetchCourseFailure',
    defaultMessage: 'Failed to fetch information of the course.',
  },
  descriptionHeader: {
    id: 'course.courses.show.description',
    defaultMessage: 'Description',
  },
  instructorsHeader: {
    id: 'course.courses.show.instructors',
    defaultMessage: 'Instructors',
  },
  pendingAssessmentsHeader: {
    id: 'course.courses.show.pendingAssessments',
    defaultMessage: 'Pending Assessments',
  },
  latestActivityHeader: {
    id: 'course.courses.show.latestActivity',
    defaultMessage: 'Latest Activity',
  },
});

const CourseShow: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { courseId } = useParams();
  const course = useSelector((state: AppState) =>
    getCourseEntity(state, +courseId!),
  );

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
    <>
      <PageHeader title={course.title} />

      {!course.permissions.isCurrentCourseUser && (
        <>
          <Grid container columns={{ xs: 1, lg: 4 }} direction="row-reverse">
            <Grid item xs={1} lg={3}>
              <div style={{ display: 'flex', justifyContent: 'right' }}>
                {course.registrationInfo && (
                  <CourseEnrollOptions
                    registrationInfo={course.registrationInfo}
                  />
                )}
              </div>
            </Grid>
            <Grid item xs={1} lg={1}>
              <h2 style={{ marginRight: 20, marginTop: 5 }}>
                {intl.formatMessage(translations.descriptionHeader)}
              </h2>
            </Grid>
          </Grid>
          <div
            id="course-description"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <h2>{intl.formatMessage(translations.instructorsHeader)}</h2>
          <Grid container spacing={1}>
            {course.instructors?.map((instructor) => (
              <Grid item key={instructor.id} xs={3} sm={2} lg={1}>
                <div id={`instructor-${instructor.id}`}>
                  <AvatarWithLabel
                    label={instructor.name}
                    imageUrl={instructor.imageUrl}
                    size="sm"
                  />
                </div>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {(course.permissions.isCurrentCourseUser ||
        course.permissions.canManage) && (
        <>
          <CourseAnnouncements
            announcements={course.currentlyActiveAnnouncements}
          />

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
    </>
  );
};

export default injectIntl(CourseShow);
