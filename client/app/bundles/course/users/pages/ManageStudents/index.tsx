import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Typography } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/pages/PageHeader';
import manageUsersTranslations from 'lib/translations/course/users/index';
import { fetchStudents } from '../../operations';
import {
  getAllStudentMiniEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';
import UserManagementButtons from '../../components/buttons/UserManagementButtons';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageStudentsTitle: {
    id: 'course.users.manage.students.title',
    defaultMessage: 'Students',
  },
  noStudents: {
    id: 'course.users.manage.noStudents',
    defaultMessage: 'No students in course',
  },
});

const ManageStudents: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const students = useSelector((state: AppState) =>
    getAllStudentMiniEntities(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchStudents())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() =>
        toast.error(
          intl.formatMessage(manageUsersTranslations.fetchUsersFailure),
        ),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const renderEmptyState = (): JSX.Element => {
    return (
      <Typography variant="body1">
        {intl.formatMessage(translations.noStudents)}
      </Typography>
    );
  };

  return (
    <>
      <PageHeader
        title={intl.formatMessage(manageUsersTranslations.manageUsersHeader)}
      />
      <UserManagementTabs permissions={permissions} sharedData={sharedData} />
      {students.length > 0 ? (
        <ManageUsersTable
          title={intl.formatMessage(translations.manageStudentsTitle)}
          users={students}
          renderRowActionComponent={(user): JSX.Element => (
            <UserManagementButtons user={user} />
          )}
        />
      ) : (
        renderEmptyState()
      )}
    </>
  );
};

export default injectIntl(ManageStudents);
