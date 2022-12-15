import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';

import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import PendingEnrolRequestsButtons from '../../components/buttons/PendingEnrolRequestsButtons';
import EnrolRequestsTable from '../../components/tables/EnrolRequestsTable';
import { fetchEnrolRequests } from '../../operations';
import {
  getAllEnrolRequestEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.enrolRequests.UserRequests.manageUsersHeader',
    defaultMessage: 'Manage Users',
  },
  pending: {
    id: 'course.enrolRequests.UserRequests.pending',
    defaultMessage: 'Pending Enrolment Requests',
  },
  approved: {
    id: 'course.enrolRequests.UserRequests.approved',
    defaultMessage: 'Approved Enrolment Requests',
  },
  rejected: {
    id: 'course.enrolRequests.UserRequests.rejected',
    defaultMessage: 'Rejected Enrolment Requests',
  },
  noEnrolRequests: {
    id: 'course.enrolRequests.UserRequests.noEnrolRequests',
    defaultMessage: 'There is no enrol request.',
  },
  fetchEnrolRequestsFailure: {
    id: 'course.enrolRequests.UserRequests.fetchEnrolRequestsFailure',
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

  const renderEmptyState = (): JSX.Element | undefined => {
    if (
      pendingEnrolRequests.length === 0 &&
      approvedEnrolRequests.length === 0 &&
      rejectedEnrolRequests.length === 0
    ) {
      return (
        <Note message={intl.formatMessage(translations.noEnrolRequests)} />
      );
    }
    return undefined;
  };

  return (
    <Box>
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <UserManagementTabs
            permissions={permissions}
            sharedData={sharedData}
          />
          {renderEmptyState()}
          {pendingEnrolRequests.length > 0 && (
            <EnrolRequestsTable
              enrolRequests={pendingEnrolRequests}
              pendingEnrolRequests
              renderRowActionComponent={(enrolRequest): JSX.Element => (
                <PendingEnrolRequestsButtons enrolRequest={enrolRequest} />
              )}
              title={intl.formatMessage(translations.pending)}
            />
          )}
          {approvedEnrolRequests.length > 0 && (
            <EnrolRequestsTable
              approvedEnrolRequests
              enrolRequests={approvedEnrolRequests}
              title={intl.formatMessage(translations.approved)}
            />
          )}
          {rejectedEnrolRequests.length > 0 && (
            <EnrolRequestsTable
              enrolRequests={rejectedEnrolRequests}
              rejectedEnrolRequests
              title={intl.formatMessage(translations.rejected)}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default injectIntl(UserRequests);
