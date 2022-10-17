import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Typography } from '@mui/material';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/navigation/PageHeader';
import manageUsersTranslations from 'lib/translations/course/users/index';
import { fetchStaff } from '../../operations';
import {
  getAllStaffMiniEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';
import UpgradeToStaff from '../../components/misc/UpgradeToStaff';
import UserManagementButtons from '../../components/buttons/UserManagementButtons';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageStaffTitle: {
    id: 'course.users.manage.staff.title',
    defaultMessage: 'Staff',
  },
  noStaff: {
    id: 'course.users.manage.noStaff',
    defaultMessage: 'No staff in course',
  },
});

const ManageStaff: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const staff = useSelector((state: AppState) =>
    getAllStaffMiniEntities(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchStaff())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(
          intl.formatMessage(manageUsersTranslations.fetchUsersFailure),
        ),
      );
  }, [dispatch]);

  const renderEmptyState = (): JSX.Element => {
    return (
      <Typography variant="body1">
        {intl.formatMessage(translations.noStaff)}
      </Typography>
    );
  };

  return (
    <>
      <PageHeader
        title={intl.formatMessage(manageUsersTranslations.manageUsersHeader)}
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <UserManagementTabs
            permissions={permissions}
            sharedData={sharedData}
          />
          <UpgradeToStaff />
          {staff.length > 0 ? (
            <ManageUsersTable
              title={intl.formatMessage(translations.manageStaffTitle)}
              users={staff}
              manageStaff
              renderRowActionComponent={(user): JSX.Element => (
                <UserManagementButtons user={user} />
              )}
              csvDownloadOptions={{ filename: 'Staff List' }}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </>
  );
};

export default injectIntl(ManageStaff);
