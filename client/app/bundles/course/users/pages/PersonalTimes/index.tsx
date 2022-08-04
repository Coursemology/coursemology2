import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/pages/PageHeader';
import { Paper, Typography } from '@mui/material';
import { fetchUsers } from '../../operations';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import SelectCourseUser from '../../components/misc/SelectCourseUser';
import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  fetchUsersFailure: {
    id: 'course.users.manage.fetch.failue',
    defaultMessage: 'Failed to fetch users',
  },
  courseUserHeader: {
    id: 'course.users.personalTimes.header',
    defaultMessage: 'Course User',
  },
});

const PersonalTimes: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers(true))
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      );
  }, [dispatch]);

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <UserManagementTabs
            permissions={permissions}
            sharedData={sharedData}
          />
          <Paper
            elevation={3}
            sx={{ padding: '12px 24px 24px 24px', margin: '12px 0px' }}
          >
            <Typography variant="h6" sx={{ marginBottom: '24px' }}>
              {intl.formatMessage(translations.courseUserHeader)}
            </Typography>

            <SelectCourseUser />
          </Paper>
        </>
      )}
    </>
  );
};

export default injectIntl(PersonalTimes);
