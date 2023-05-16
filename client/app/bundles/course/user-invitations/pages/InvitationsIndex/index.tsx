import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

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
    id: 'course.userInvitations.InvitationsIndex.manageUsersHeader',
    defaultMessage: 'Manage Users',
  },
  pending: {
    id: 'course.userInvitations.InvitationsIndex.pending',
    defaultMessage: 'Pending Invitations',
  },
  accepted: {
    id: 'course.userInvitations.InvitationsIndex.accepted',
    defaultMessage: 'Accepted Invitations',
  },
  failure: {
    id: 'course.userInvitations.InvitationsIndex.failure',
    defaultMessage: 'Failed to fetch all invitations',
  },
  invitationsInfo: {
    id: 'course.userInvitations.InvitationsIndex.invitationsInfo',
    defaultMessage:
      'The page lists all invitations which have been sent out to date.\nUsers can key in their invitation code into the course registration page to manually register into this course.',
  },
});

const InviteUsers: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const invitations = useAppSelector(getAllInvitationsMiniEntities);
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const sharedData = useAppSelector(getManageCourseUsersSharedData);

  const pendingInvitations = invitations.filter(
    (invitation) => !invitation.confirmed,
  );
  const acceptedInvitations = invitations.filter(
    (invitation) => invitation.confirmed,
  );

  const dispatch = useAppDispatch();

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
              pendingInvitations
              renderRowActionComponent={(invitation): JSX.Element => (
                <PendingInvitationsButtons invitation={invitation} />
              )}
              title={intl.formatMessage(translations.pending)}
            />
          )}

          {acceptedInvitations.length > 0 && (
            <UserInvitationsTable
              acceptedInvitations
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
