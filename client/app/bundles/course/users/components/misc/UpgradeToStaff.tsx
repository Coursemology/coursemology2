import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import { CourseUserData } from 'types/course/courseUsers';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { upgradeToStaff } from '../../operations';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
interface Props extends WrappedComponentProps {
  students: CourseUserData[];
}

const translations = defineMessages({
  upgradeSuccess: {
    id: 'course.user.components.misc.upgradeToStaff.success',
    defaultMessage: '{name} is now a {role}',
  },
  upgradeFailure: {
    id: 'course.user.components.misc.upgradeToStaff.fail',
    defaultMessage: 'Failed to update user.',
  },
  upgradeHeader: {
    id: 'course.user.components.misc.upgradeToStaff.header',
    defaultMessage: 'Upgrade Student',
  },
  nameLabel: {
    id: 'course.user.components.misc.upgradeToStaff.label',
    defaultMessage: 'Name',
  },
  upgradeButton: {
    id: 'course.user.components.misc.upgradeToStaff.button',
    defaultMessage: 'Upgrade to staff',
  },
});

const UpgradeToStaff: FC<Props> = (props) => {
  const { students, intl } = props;
  const [users, setUsers] = useState<CourseUserData[]>([]);
  const [role, setRole] = useState(sharedConstants.STAFF_ROLES[0].value);
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (): void => {
    return users.forEach((user) =>
      dispatch(upgradeToStaff(user.id, role))
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
          setUsers([]);
        })
        .catch((error) => {
          toast.error(
            intl.formatMessage(translations.upgradeFailure, {
              error,
            }),
          );
          throw error;
        }),
    );
  };

  const handleNameChange = (_event, newValue): void => {
    setUsers(newValue);
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
      <Grid container flexDirection="row" alignItems="center">
        <Autocomplete
          multiple
          disableCloseOnSelect
          id="upgrade-student-name"
          limitTags={3}
          value={users}
          onChange={handleNameChange}
          options={students}
          getOptionLabel={(option): string => option.name}
          // eslint-disable-next-line @typescript-eslint/no-shadow
          renderOption={(props, option, { selected }): JSX.Element => (
            <Box component="li" {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.name}
            </Box>
          )}
          renderInput={(params): JSX.Element => (
            <TextField
              {...params}
              label={intl.formatMessage(translations.nameLabel)}
              variant="standard"
            />
          )}
          sx={{ minWidth: '300px', marginRight: '12px' }}
        />
        <TextField
          label="Role"
          id="upgrade-student-role"
          select
          value={role}
          variant="standard"
          onChange={handleRoleChange}
          sx={{ minWidth: '300px', marginRight: '12px' }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
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
