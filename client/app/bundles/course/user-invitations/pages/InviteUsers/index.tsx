import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Box, Grid, Typography } from '@mui/material';
import { InvitationResult } from 'types/course/userInvitations';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import RegistrationCodeButton from '../../components/buttons/RegistrationCodeButton';
import UploadFileButton from '../../components/buttons/UploadFileButton';
import IndividualInviteForm from '../../components/forms/IndividualInviteForm';
import InvitationResultDialog from '../../components/misc/InvitationResultDialog';
import { fetchPermissionsAndSharedData } from '../../operations';
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
  inviteUsersHeader: {
    id: 'course.users.userInvitations.header',
    defaultMessage: 'Invite Users',
  },
  loadFailure: {
    id: 'course.users.userInvitations.fetch.failure',
    defaultMessage: 'Failed to load data',
  },
});

const InviteUsers: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [showInvitationResultDialog, setShowInvitationResultDialog] =
    useState(false);
  const [invitationResult, setInvitationResult] = useState({});
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchPermissionsAndSharedData())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() => toast.error(intl.formatMessage(translations.loadFailure)));
  }, [dispatch]);

  const openResultDialog = (result: InvitationResult): void => {
    setInvitationResult(result);
    setShowInvitationResultDialog(true);
  };

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
          <Box>
            <Grid
              alignItems="flex-end"
              container
              flexDirection="row"
              justifyContent="space-between"
              sx={{ margin: '12px 0px' }}
            >
              <Typography variant="h5">
                {intl.formatMessage(translations.inviteUsersHeader)}
              </Typography>
              <Grid item style={{ display: 'flex', gap: 12 }}>
                <UploadFileButton openResultDialog={openResultDialog} />
                <RegistrationCodeButton />
              </Grid>
            </Grid>
            <IndividualInviteForm openResultDialog={openResultDialog} />
          </Box>
          <InvitationResultDialog
            handleClose={(): void => setShowInvitationResultDialog(false)}
            invitationResult={invitationResult}
            open={showInvitationResultDialog}
          />
        </>
      )}
    </>
  );
};

export default injectIntl(InviteUsers);
