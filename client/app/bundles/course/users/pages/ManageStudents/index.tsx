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
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';
import { fetchStudents } from '../../operations';
import {
  getAllStudentMiniEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageStudentsTitle: {
    id: 'course.users.ManageStudents.manageStudentsTitle',
    defaultMessage: 'Students',
  },
  noStudents: {
    id: 'course.users.ManageStudents.noStudents',
    defaultMessage: 'No students in course... yet!',
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

  const renderEmptyState = (): JSX.Element => {
    return <Note message={intl.formatMessage(translations.noStudents)} />;
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
          {students.length > 0 ? (
            <ManageUsersTable
              csvDownloadOptions={{ filename: 'Student List' }}
              renderRowActionComponent={(user): JSX.Element => (
                <UserManagementButtons user={user} />
              )}
              title={intl.formatMessage(translations.manageStudentsTitle)}
              users={students}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </>
  );
};

export default injectIntl(ManageStudents);
