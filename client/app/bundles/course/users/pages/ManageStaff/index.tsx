import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Typography } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/pages/PageHeader';
import { fetchStaff } from '../../operations';
import {
  getAllStudentsEntities,
  getAllStaffEntities,
  getCourseUserPermissions,
} from '../../selectors';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';
import UpgradeToStaff from '../../components/misc/UpgradeToStaff';

interface Props {
  intl?: any;
}

// const styles = {
//   courseUserImage: {
//     height: 75,
//     width: 75,
//     marginTop: '1em',
//   },
//   courseUserName: {
//     paddingTop: '2em',
//   },
// };

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  noStudents: {
    id: 'course.users.manage.noStaff',
    defaultMessage: 'No staff in course',
  },
  fetchUsersFailure: {
    id: 'course.users.manage.fetch.failue',
    defaultMessage: 'Failed to fetch users',
  },
});

const ManageStaff: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const students = useSelector((state: AppState) =>
    getAllStudentsEntities(state),
  );
  const staff = useSelector((state: AppState) => getAllStaffEntities(state));
  const permissions = useSelector((state: AppState) =>
    getCourseUserPermissions(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchStaff())
      .finally(() => setIsLoading(false))
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
        {intl.formatMessage(translations.noStaff)}
      </Typography>
    );
  };

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      <UserManagementTabs permissions={permissions} />
      <UpgradeToStaff students={students} />
      {staff.length > 0 ? (
        <ManageUsersTable
          title="Staff"
          users={staff}
          permissions={permissions}
          showRoleColumn={true}
        />
      ) : (
        renderEmptyState()
      )}
    </>
  );
};

export default injectIntl(ManageStaff);
