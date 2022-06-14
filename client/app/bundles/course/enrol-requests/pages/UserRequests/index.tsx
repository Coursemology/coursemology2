import { Box } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';
import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import { fetchEnrolRequests } from '../../operations';
import {
  getAllEnrolRequestEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';
import EnrolRequestsTable from '../../components/tables/EnrolRequestsTable';
import PendingEnrolRequestsButtons from '../../components/buttons/PendingEnrolRequestsButtons';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  pending: {
    id: 'course.users.enrolRequests.pending.title',
    defaultMessage: 'Pending Enrolment Requests',
  },
  approved: {
    id: 'course.users.enrolRequests.approved.title',
    defaultMessage: 'Approved Enrolment Requests',
  },
  rejected: {
    id: 'course.users.enrolRequests.rejected.title',
    defaultMessage: 'Rejected Enrolment Requests',
  },
  fetchEnrolRequestsFailure: {
    id: 'fail',
    defaultMessage: 'Failed to fetch enrol requests',
  },
});

const UserRequests: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const enrolRequests = useSelector((state: AppState) =>
    getAllEnrolRequestEntities(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const pendingEnrolRequests = enrolRequests.filter(
    (enrolRequest) => enrolRequest.status === 'pending',
  );
  const approvedEnrolRequests = enrolRequests.filter(
    (enrolRequest) => enrolRequest.status === 'approved',
  );
  const rejectedEnrolRequests = enrolRequests.filter(
    (enrolRequest) => enrolRequest.status === 'rejected',
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchEnrolRequests())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchEnrolRequestsFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Box>
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      <UserManagementTabs permissions={permissions} sharedData={sharedData} />
      {pendingEnrolRequests.length > 0 && (
        <EnrolRequestsTable
          title={intl.formatMessage(translations.pending)}
          enrolRequests={pendingEnrolRequests}
          permissions={permissions}
          defaultTimelineAlgorithm={sharedData.defaultTimelineAlgorithm}
          pendingEnrolRequests
          renderRowActionComponent={(enrolRequest): JSX.Element => (
            <PendingEnrolRequestsButtons enrolRequest={enrolRequest} />
          )}
        />
      )}
      {approvedEnrolRequests.length > 0 && (
        <EnrolRequestsTable
          title={intl.formatMessage(translations.approved)}
          enrolRequests={approvedEnrolRequests}
          permissions={permissions}
          approvedEnrolRequests
        />
      )}
      {rejectedEnrolRequests.length > 0 && (
        <EnrolRequestsTable
          title={intl.formatMessage(translations.rejected)}
          enrolRequests={rejectedEnrolRequests}
          permissions={permissions}
          rejectedEnrolRequests
        />
      )}
    </Box>
  );
};

export default injectIntl(UserRequests);
