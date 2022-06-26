import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import PageHeader from 'lib/components/pages/PageHeader';
import { AppDispatch, AppState } from 'types/store';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { fetchCourses } from '../../operations';
import {
  getAllCourseMiniEntities,
  getCourseInstanceUserRoleRequest,
  getCoursePermissions,
} from '../../selectors';
import CourseDisplay from '../../components/misc/CourseDisplay';
import CoursesNew from '../CoursesNew';

type Props = WrappedComponentProps;

const styles = {
  newButton: {
    background: 'white',
    fontSize: 14,
  },
};

const translations = defineMessages({
  newCourse: {
    id: 'course.new',
    defaultMessage: 'New Course',
  },
  fetchCoursesFailure: {
    id: 'course.index.fetch.failure',
    defaultMessage: 'Failed to retrieve courses.',
  },
  newRequest: {
    id: 'request.new',
    defaultMessage: 'Request to be an instructor',
  },
  editRequest: {
    id: 'request.edit',
    defaultMessage: 'Edit your request',
  },
});

const CoursesIndex: FC<Props> = (props) => {
  const { intl } = props;

  const [isOpen, setIsOpen] = useState(false); // For creating new course
  const [isLoading, setIsLoading] = useState(true);

  const courses = useSelector((state: AppState) =>
    getAllCourseMiniEntities(state),
  );

  const coursesPermissions = useSelector((state: AppState) =>
    getCoursePermissions(state),
  );

  const instanceUserRoleRequestId = useSelector((state: AppState) =>
    getCourseInstanceUserRoleRequest(state),
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCourses())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCoursesFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Adding appropriate button to the header
  const headerToolbars: ReactElement[] = [];
  if (coursesPermissions?.canCreate) {
    headerToolbars.push(
      <Button
        className="new-course-button"
        key="new-course-button"
        variant="outlined"
        color="primary"
        onClick={(): void => setIsOpen(true)}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.newCourse)}
      </Button>,
    );
  } else {
    headerToolbars.push(
      <Button
        key="role-request-button"
        id="role-request-button"
        variant="outlined"
        color="primary"
        // TODO Route this properly after role_request page is refactored
        onClick={(): void => {
          if (instanceUserRoleRequestId) {
            window.location.href = `role_requests/${instanceUserRoleRequestId}/edit`;
          } else {
            window.location.href = 'role_requests/new';
          }
        }}
        style={styles.newButton}
      >
        {instanceUserRoleRequestId
          ? intl.formatMessage(translations.editRequest)
          : intl.formatMessage(translations.newRequest)}
      </Button>,
    );
  }

  return (
    <>
      <PageHeader
        title={intl.formatMessage({
          id: 'course.header',
          defaultMessage: 'Courses',
        })}
        toolbars={headerToolbars}
      />
      <CourseDisplay courses={courses} />
      <CoursesNew open={isOpen} handleClose={(): void => setIsOpen(false)} />
    </>
  );
};

export default injectIntl(CoursesIndex);
