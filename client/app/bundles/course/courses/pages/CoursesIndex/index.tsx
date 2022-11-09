import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import useTranslation from 'lib/hooks/useTranslation';

import InstanceUserRoleRequestForm from '../../../../system/admin/instance/instance/components/forms/InstanceUserRoleRequestForm';
import CourseDisplay from '../../components/misc/CourseDisplay';
import { fetchCourses } from '../../operations';
import {
  getAllCourseMiniEntities,
  getCourseInstanceUserRoleRequest,
  getCoursePermissions,
} from '../../selectors';
import CoursesNew from '../CoursesNew';

const styles = {
  newButton: {
    background: 'white',
    fontSize: 14,
  },
};

const translations = defineMessages({
  header: {
    id: 'course.header',
    defaultMessage: 'Courses',
  },
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

const CoursesIndex: FC = () => {
  const { t } = useTranslation();
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
      .catch(() => toast.error(t(translations.fetchCoursesFailure)));
  }, [dispatch]);

  // Adding appropriate button to the header
  const headerToolbars: ReactElement[] = [];
  if (coursesPermissions?.canCreate) {
    headerToolbars.push(
      <Button
        key="new-course-button"
        className="new-course-button"
        color="primary"
        onClick={(): void => setIsNewCourseDialogOpen(true)}
        style={styles.newButton}
        variant="outlined"
      >
        {t(translations.newCourse)}
      </Button>,
    );
  } else if (!isLoading) {
    headerToolbars.push(
      <Button
        key="role-request-button"
        color="primary"
        id="role-request-button"
        onClick={(): void => setRoleRequestDialogOpen(true)}
        style={styles.newButton}
        variant="outlined"
      >
        {instanceUserRoleRequest
          ? t(translations.editRequest)
          : t(translations.newRequest)}
      </Button>,
    );
  }

  return (
    <>
      <PageHeader title={t(translations.header)} toolbars={headerToolbars} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <CourseDisplay courses={courses} />
          {isNewCourseDialogOpen && (
            <CoursesNew
              onClose={(): void => setIsNewCourseDialogOpen(false)}
              open={isNewCourseDialogOpen}
            />
          )}
          {isRoleRequestDialogOpen && (
            <InstanceUserRoleRequestForm
              instanceUserRoleRequest={instanceUserRoleRequest}
              onClose={(): void => setRoleRequestDialogOpen(false)}
              open={isRoleRequestDialogOpen}
            />
          )}
        </>
      )}
    </>
  );
};

export default CoursesIndex;
