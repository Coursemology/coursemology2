import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import { CourseUserData } from 'types/course/course_users';
import { upgradeToStaff } from '../../operations';

interface Props extends WrappedComponentProps {
  students: CourseUserData[];
}

const translations = defineMessages({
  upgradeSuccess: {
    id: 'course.user.upgradeToStaff.success',
    defaultMessage: '{name} is now a {role}',
  },
  upgradeFailure: {
    id: 'course.user.upgradeToStaff.fail',
    defaultMessage: 'Failed to update user.',
  },
  upgradeHeader: {
    id: 'course.user.upgradeToStaff.header',
    defaultMessage: 'Upgrade student',
  },
  upgradeButton: {
    id: 'course.user.upgradeToStaff.button',
    defaultMessage: 'Upgrade to staff',
  },
});

const UpgradeToStaff: FC<Props> = (props) => {
  const { students, intl } = props;
  const [user, setUser] = useState(students[0]);
  const [role, setRole] = useState(sharedConstants.STAFF_ROLES[0].value);
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (): Promise<void> => {
    return dispatch(upgradeToStaff(user.id, role))
      .then(() => {
        const roleLabel = sharedConstants.STAFF_ROLES.find(
          (roleObjs) => roleObjs.value === role,
        )?.label;
        toast.success(
          intl.formatMessage(translations.upgradeSuccess, {
            name: user.name,
            role: roleLabel,
          }),
        );
        setUser(students[0]);
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.upgradeFailure, {
            error,
          }),
        );
        throw error;
      });
  };

  const handleNameChange = (_event, newValue): void => {
    setUser(newValue);
  };

  const handleRoleChange = (event): void => {
    setRole(event.target.value);
  };

  return (
    <Paper
      sx={{ padding: '12px 24px 24px 24px', margin: '12px 0px' }}
      elevation={3}
    >
      <Typography variant="h6" sx={{ marginBottom: '24px' }}>
        {intl.formatMessage(translations.upgradeHeader)}
      </Typography>
      <Grid container flexDirection="row">
        <Autocomplete
          id="upgrade-student-name"
          value={user}
          onChange={handleNameChange}
          options={students}
          getOptionLabel={(option): string => option.name}
          renderOption={(props, option): JSX.Element => (
            <Box component="li" {...props}>
              {option.name}
            </Box>
          )}
          renderInput={(params): JSX.Element => (
            <TextField {...params} label="Name" variant="standard" />
          )}
          sx={{ width: '25%', marginRight: '12px' }}
        />
        <TextField
          label="Role"
          id="upgrade-student-role"
          select
          value={role}
          variant="standard"
          onChange={handleRoleChange}
          sx={{ width: '25%', marginRight: '12px' }}
        >
          {sharedConstants.STAFF_ROLES.map((role) => (
            <MenuItem
              key={`upgrade-student-role-${role.value}`}
              value={role.value}
            >
              {role.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          onClick={onSubmit}
          style={{ marginTop: '4px' }}
        >
          {intl.formatMessage(translations.upgradeButton)}
        </Button>
      </Grid>
    </Paper>
  );
};

export default injectIntl(UpgradeToStaff);
