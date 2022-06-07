import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Typography } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/pages/PageHeader';
import { fetchStudents } from '../../operations';
import {
  getAllStudentsEntities,
  getCourseUserPermissions,
} from '../../selectors';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';

interface Props {
  intl?: any;
}

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  noStudents: {
    id: 'course.users.manage.noStudents',
    defaultMessage: 'No students in course',
  },
  fetchUsersFailure: {
    id: 'course.users.manage.fetch.failue',
    defaultMessage: 'Failed to fetch users',
  },
});

const ManageStudents: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const students = useSelector((state: AppState) =>
    getAllStudentsEntities(state),
  );
  const permissions = useSelector((state: AppState) =>
    getCourseUserPermissions(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchStudents())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
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
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      <UserManagementTabs permissions={permissions} />
      {students.length > 0 ? (
        <ManageUsersTable
          title="Students"
          users={students}
          permissions={permissions}
        />
      ) : (
        renderEmptyState()
      )}
    </>
  );
};

export default injectIntl(ManageStudents);
