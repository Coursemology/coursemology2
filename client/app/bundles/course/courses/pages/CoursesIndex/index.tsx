import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import PageHeader from 'lib/components/navigation/PageHeader';
import { AppDispatch, AppState } from 'types/store';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { fetchCourses } from '../../operations';
import {
  getAllCourseMiniEntities,
  getCourseInstanceUserRoleRequest,
  getCoursePermissions,
} from '../../selectors';
import CourseDisplay from '../../components/misc/CourseDisplay';
import CoursesNew from '../CoursesNew';
import InstanceUserRoleRequestForm from '../../../../system/admin/instance/instance/components/forms/InstanceUserRoleRequestForm';

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

  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleRequestDialogOpen, setRoleRequestDialogOpen] = useState(false);
  const courses = useSelector((state: AppState) =>
    getAllCourseMiniEntities(state),
  );

  const coursesPermissions = useSelector((state: AppState) =>
    getCoursePermissions(state),
  );

  const instanceUserRoleRequest = useSelector((state: AppState) =>
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

  // Adding appropriate button to the header
  const headerToolbars: ReactElement[] = [];
  if (coursesPermissions?.canCreate) {
    headerToolbars.push(
      <Button
        className="new-course-button"
        key="new-course-button"
        variant="outlined"
        color="primary"
        onClick={(): void => setIsNewCourseDialogOpen(true)}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.newCourse)}
      </Button>,
    );
  } else if (!isLoading) {
    headerToolbars.push(
      <Button
        key="role-request-button"
        id="role-request-button"
        variant="outlined"
        color="primary"
        onClick={(): void => setRoleRequestDialogOpen(true)}
        style={styles.newButton}
      >
        {instanceUserRoleRequest
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
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <CourseDisplay courses={courses} />
          {isNewCourseDialogOpen && (
            <CoursesNew
              handleClose={(): void => setIsNewCourseDialogOpen(false)}
            />
          )}
          {isRoleRequestDialogOpen && (
            <InstanceUserRoleRequestForm
              handleClose={(): void => setRoleRequestDialogOpen(false)}
              instanceUserRoleRequest={instanceUserRoleRequest}
            />
          )}
        </>
      )}
    </>
  );
};

export default injectIntl(CoursesIndex);
