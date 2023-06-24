import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import manageUsersTranslations from 'lib/translations/course/users/index';

import UserManagementButtons from '../../components/buttons/UserManagementButtons';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import ManageUsersTable from '../../components/tables/ManageUsersTable';
import { fetchStudents } from '../../operations';
import {
  getAllStudentMiniEntities,
  getAssignableTimelines,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  noStudents: {
    id: 'course.users.ManageStudents.noStudents',
    defaultMessage: 'No students in course... yet!',
  },
});

const ManageStudents: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);

  const students = useAppSelector(getAllStudentMiniEntities);
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const sharedData = useAppSelector(getManageCourseUsersSharedData);
  const timelines = useAppSelector(getAssignableTimelines);

  const dispatch = useAppDispatch();

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

          {students.length > 0 ? (
            <ManageUsersTable
              className="mt-8"
              csvDownloadFilename="Student List"
              renderRowActionComponent={(user): JSX.Element => (
                <UserManagementButtons user={user} />
              )}
              timelinesMap={timelines}
              users={students}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </Page>
  );
};

export default injectIntl(ManageStudents);
