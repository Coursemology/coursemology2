import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
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
    id: 'course.courses.CoursesIndex.header',
    defaultMessage: 'Courses',
  },
  newCourse: {
    id: 'course.courses.CoursesIndex.newCourse',
    defaultMessage: 'New Course',
  },
  fetchCoursesFailure: {
    id: 'course.courses.CoursesIndex.fetchCoursesFailure',
    defaultMessage: 'Failed to retrieve courses.',
  },
  newRequest: {
    id: 'course.courses.CoursesIndex.newRequest',
    defaultMessage: 'Request to be an instructor',
  },
  editRequest: {
    id: 'course.courses.CoursesIndex.editRequest',
    defaultMessage: 'Edit your request',
  },
});

const CoursesIndex: FC = () => {
  const { t } = useTranslation();

  const [params] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isRoleRequestDialogOpen, setRoleRequestDialogOpen] = useState(false);
  const courses = useAppSelector(getAllCourseMiniEntities);

  const coursesPermissions = useAppSelector(getCoursePermissions);

  const instanceUserRoleRequest = useAppSelector(
    getCourseInstanceUserRoleRequest,
  );

  const dispatch = useAppDispatch();

  const shouldOpenNewCourseDialog =
    Boolean(params.get('new')) && coursesPermissions?.canCreate;

  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(
    shouldOpenNewCourseDialog,
  );

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
  } else if (!isLoading && coursesPermissions?.isCurrentUser) {
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
    <Page actions={headerToolbars} title={t(translations.header)}>
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
    </Page>
  );
};

const handle = translations.header;

export default Object.assign(CoursesIndex, { handle });
