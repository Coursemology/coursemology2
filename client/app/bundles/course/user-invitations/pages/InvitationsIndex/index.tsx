import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { Box, Typography } from '@mui/material';
import PageHeader from 'lib/components/pages/PageHeader';
import {
  getManageCourseUsersTabData,
  getManageCourseUserPermissions,
  getAllInvitationsEntities,
} from '../../selectors';
import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import { fetchInvitations } from '../../operations';
import UserInvitationsTable from '../../components/tables/UserInvitationsTable';
import InvitationsBarChart from '../../components/misc/InvitationsBarChart';
import PendingInvitationsButtons from '../../components/buttons/PendingInvitationsButtons';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  fetchInvitationsFailure: {
    id: 'course.users.userInvitations.fetch.failure',
    defaultMessage: 'Unable to fetch invitations',
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
    getAllInvitationsEntities(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const tabData = useSelector((state: AppState) =>
    getManageCourseUsersTabData(state),
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
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchInvitationsFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // pendingInvitations.length = 0;

  return (
    <Box>
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      <UserManagementTabs permissions={permissions} tabData={tabData} />
      <Box sx={{ margin: '12px 0px' }}>
        <InvitationsBarChart
          accepted={acceptedInvitations.length}
          pending={pendingInvitations.length}
        />
      </Box>
      <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
        {intl.formatMessage(translations.invitationsInfo)}
      </Typography>

      {pendingInvitations.length > 0 && (
        <UserInvitationsTable
          title="Pending Invitations"
          invitations={pendingInvitations}
          pendingInvitations
          renderRowActionComponent={(invitation): JSX.Element => (
            <PendingInvitationsButtons invitation={invitation} />
          )}
        />
      )}

      {acceptedInvitations.length > 0 && (
        <UserInvitationsTable
          title="Accepted Invitations"
          invitations={acceptedInvitations}
          acceptedInvitations
        />
      )}
    </Box>
  );
};

export default injectIntl(InviteUsers);
