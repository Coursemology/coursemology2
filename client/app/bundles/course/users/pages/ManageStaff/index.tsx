import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
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
  noStaff: {
    id: 'course.users.ManageStaff.noStaff',
    defaultMessage: 'No staff in course.',
  },
});

const ManageStaff: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const staff = useAppSelector(getAllStaffMiniEntities);
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const sharedData = useAppSelector(getManageCourseUsersSharedData);
  const dispatch = useAppDispatch();

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
    <Page
      title={intl.formatMessage(manageUsersTranslations.manageUsersHeader)}
      unpadded
    >
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
              csvDownloadFilename="Staff List"
              manageStaff
              renderRowActionComponent={(user): JSX.Element => (
                <UserManagementButtons user={user} />
              )}
              users={staff}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </Page>
  );
};

export default injectIntl(ManageStaff);
