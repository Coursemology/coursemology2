import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Box, Grid, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import {
  getManageCourseUsersSharedData,
  getManageCourseUserPermissions,
} from '../../selectors';
import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import { fetchInvitations } from '../../operations';
import RegistrationCodeButton from '../../components/buttons/RegistrationCodeButton';
import UploadFileButton from '../../components/buttons/UploadFileButton';
import IndividualInviteForm from '../../components/forms/IndividualInviteForm';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  inviteUsersHeader: {
    id: 'course.users.userInvitations.header',
    defaultMessage: 'Invite Users',
  },
  fetchInvitationsFailure: {
    id: 'course.users.userInvitations.fetch.failure',
    defaultMessage: 'Unable to fetch invitations',
  },
});

const InviteUsers: FC<Props> = (props) => {
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

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      <UserManagementTabs permissions={permissions} sharedData={sharedData} />
      <Box>
        <Grid
          container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-end"
          sx={{ margin: '12px 0px' }}
        >
          <Typography variant="h5">
            {intl.formatMessage(translations.inviteUsersHeader)}
          </Typography>
          <Grid item style={{ display: 'flex', gap: 12 }}>
            <UploadFileButton />
            <RegistrationCodeButton />
          </Grid>
        </Grid>
        <IndividualInviteForm permissions={permissions} />
      </Box>
    </>
  );
};

export default injectIntl(InviteUsers);
