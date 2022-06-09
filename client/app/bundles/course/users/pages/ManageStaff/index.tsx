import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
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
  getManageCourseUserPermissions,
  getManageCourseUsersTabData,
} from '../../selectors';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';
import UpgradeToStaff from '../../components/misc/UpgradeToStaff';
import UserManagementButtons from '../../components/buttons/UserManagementButtons';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  noStaff: {
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
    getManageCourseUserPermissions(state),
  );
  const tabData = useSelector((state: AppState) =>
    getManageCourseUsersTabData(state),
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
      <UserManagementTabs permissions={permissions} tabData={tabData} />
      <UpgradeToStaff students={students} />
      {staff.length > 0 ? (
        <ManageUsersTable
          title="Staff"
          users={staff}
          permissions={permissions}
          manageStaff
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

export default injectIntl(ManageStaff);
