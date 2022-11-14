import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';
import manageUsersTranslations from 'lib/translations/course/users/index';

import UserManagementButtons from '../../components/buttons/UserManagementButtons';
import UpgradeToStaff from '../../components/misc/UpgradeToStaff';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';
import { fetchStaff } from '../../operations';
import {
  getAllStaffMiniEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageStaffTitle: {
    id: 'course.users.manage.staff.title',
    defaultMessage: 'Staff',
  },
  noStaff: {
    id: 'course.users.manage.noStaff',
    defaultMessage: 'No staff in course.',
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
    return <Note message={intl.formatMessage(translations.noStaff)} />;
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
              csvDownloadOptions={{ filename: 'Staff List' }}
              manageStaff
              renderRowActionComponent={(user): JSX.Element => (
                <UserManagementButtons user={user} />
              )}
              title={intl.formatMessage(translations.manageStaffTitle)}
              users={staff}
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
