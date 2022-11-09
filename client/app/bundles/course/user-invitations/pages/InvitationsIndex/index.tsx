import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import PendingInvitationsButtons from '../../components/buttons/PendingInvitationsButtons';
import InvitationsBarChart from '../../components/misc/InvitationsBarChart';
import UserInvitationsTable from '../../components/tables/UserInvitationsTable';
import { fetchInvitations } from '../../operations';
import {
  getAllInvitationsMiniEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  pending: {
    id: 'course.users.userInvitations.pending.title',
    defaultMessage: 'Pending Invitations',
  },
  accepted: {
    id: 'course.users.userInvitations.accepted.title',
    defaultMessage: 'Accepted Invitations',
  },
  failure: {
    id: 'course.users.userInvitations.fetch.failure',
    defaultMessage: 'Failed to fetch all invitations',
  },
  invitationsInfo: {
    id: 'course.users.userInvitations.index.invitationsInfo',
    defaultMessage: `The page lists all invitations which have been sent out to date.\nUsers can key in their invitation code into the course registration page to manually register into this course.`,
  },
});

const InviteUsers: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const invitations = useSelector((state: AppState) =>
    getAllInvitationsMiniEntities(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );

  const pendingInvitations = invitations.filter(
    (invitation) => !invitation.confirmed,
  );
  const acceptedInvitations = invitations.filter(
    (invitation) => invitation.confirmed,
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchInvitations())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() => toast.error(intl.formatMessage(translations.failure)));
  }, [dispatch]);

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
          <Box className="invitations-bar-chart" sx={{ margin: '12px 0px' }}>
            <InvitationsBarChart
              accepted={acceptedInvitations.length}
              pending={pendingInvitations.length}
            />
          </Box>
          <Typography style={{ whiteSpace: 'pre-line' }} variant="body2">
            {intl.formatMessage(translations.invitationsInfo)}
          </Typography>

          {pendingInvitations.length > 0 && (
            <UserInvitationsTable
              invitations={pendingInvitations}
              pendingInvitations={true}
              renderRowActionComponent={(invitation): JSX.Element => (
                <PendingInvitationsButtons invitation={invitation} />
              )}
              title={intl.formatMessage(translations.pending)}
            />
          )}

          {acceptedInvitations.length > 0 && (
            <UserInvitationsTable
              acceptedInvitations={true}
              invitations={acceptedInvitations}
              title={intl.formatMessage(translations.accepted)}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default injectIntl(InviteUsers);
