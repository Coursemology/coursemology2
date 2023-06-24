import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Grid, Typography } from '@mui/material';
import { InvitationResult } from 'types/course/userInvitations';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

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
    id: 'course.userInvitations.InviteUsers.manageUsersHeader',
    defaultMessage: 'Manage Users',
  },
  inviteUsersHeader: {
    id: 'course.userInvitations.InviteUsers.inviteUsersHeader',
    defaultMessage: 'Invite Users',
  },
  loadFailure: {
    id: 'course.userInvitations.InviteUsers.loadFailure',
    defaultMessage: 'Failed to load data',
  },
});

const InviteUsers: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [showInvitationResultDialog, setShowInvitationResultDialog] =
    useState(false);
  const [invitationResult, setInvitationResult] = useState({});
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const sharedData = useAppSelector(getManageCourseUsersSharedData);

  const dispatch = useAppDispatch();

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
    <Page title={intl.formatMessage(translations.manageUsersHeader)} unpadded>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <UserManagementTabs
            permissions={permissions}
            sharedData={sharedData}
          />

          <Page.PaddedSection>
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
          </Page.PaddedSection>

          <InvitationResultDialog
            handleClose={(): void => setShowInvitationResultDialog(false)}
            invitationResult={invitationResult}
            open={showInvitationResultDialog}
          />
        </>
      )}
    </Page>
  );
};

export default injectIntl(InviteUsers);
