import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import {
  //   Box,
  Button,
  Checkbox,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Clear from '@mui/icons-material/Clear';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import {
  getManageCourseUsersTabData,
  getManageCourseUserPermissions,
} from '../../selectors';
import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import { fetchInvitations } from '../../operations';

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
});

const InviteUsers: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const tabData = useSelector((state: AppState) =>
    getManageCourseUsersTabData(state),
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
      <UserManagementTabs permissions={permissions} tabData={tabData} />
      <Grid>
        <Grid
          container
          flexDirection="row"
          justifyContent="space-between"
          sx={{ margin: '12px 0px' }}
        >
          <Typography variant="h5">Invite Users</Typography>
          <Grid item sx={{ margin: '0px 4px' }}>
            <Button variant="outlined">Upload File</Button>
            <Button variant="outlined">Registration Code</Button>
          </Grid>
        </Grid>
        <Paper elevation={3} sx={{ padding: '12px' }}>
          <Grid container flexDirection="row" justifyContent="space-between">
            <Typography variant="h5">Individually Add Users</Typography>
            <Button variant="contained">Add new row</Button>
          </Grid>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phantom</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <TextField variant="standard" />
                </TableCell>

                <TableCell>
                  <TextField variant="standard" />
                </TableCell>

                <TableCell>
                  <TextField select value="Student" variant="standard" />
                </TableCell>

                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <Clear />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Button variant="contained" sx={{ marginTop: '4px' }}>
            Invite Users
          </Button>
        </Paper>
      </Grid>
    </>
  );
};

export default injectIntl(InviteUsers);
