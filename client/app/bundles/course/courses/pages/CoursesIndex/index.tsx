import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import PageHeader from 'lib/components/pages/PageHeader';
import { AppDispatch, AppState } from 'types/store';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { fetchCourses } from '../../operations';
import {
  getAllCoursesMiniEntities,
  getCoursesPermissions,
} from '../../selectors';
import CourseDisplay from '../../components/CourseDisplay';
import CoursesNew from '../CoursesNew';

interface Props {
  intl?: any;
}

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
    getAllCoursesMiniEntities(state),
  );

  const coursesPermissions = useSelector((state: AppState) =>
    getCoursesPermissions(state),
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
        className="request-button"
        id="request-button"
        key="request-button"
        variant="outlined"
        color="primary"
        // TODO Route this properly after role_request page is refactored
        onClick={(): void =>
          coursesPermissions?.requestSubmitted
            ? window.location.assign(
                `role_requests/${coursesPermissions.requestSubmitted?.id}/edit`,
              )
            : window.location.assign('role_requests/new')
        }
        style={styles.newButton}
      >
        {coursesPermissions?.requestSubmitted
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
