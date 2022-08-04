import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import { CourseUserBasicMiniEntity, StaffRole } from 'types/course/courseUsers';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { LoadingButton } from '@mui/lab';
import { upgradeToStaff } from '../../operations';
import { getStudentOptionMiniEntities } from '../../selectors';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type Props = WrappedComponentProps;

const translations = defineMessages({
  upgradeSuccess: {
    id: 'course.user.components.misc.upgradeToStaff.success',
    defaultMessage:
      '{count, plural, =0 {No users were} one {# new user has} other {# new users have}} been upgraded to {role}',
  },
  upgradeFailure: {
    id: 'course.user.components.misc.upgradeToStaff.fail',
    defaultMessage: 'Failed to update user - {error}',
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
  const { intl } = props;

  const students = useSelector((state: AppState) =>
    getStudentOptionMiniEntities(state),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<
    CourseUserBasicMiniEntity[]
  >([]);
  const [role, setRole] = useState<StaffRole>(
    Object.keys(sharedConstants.STAFF_ROLES)[0] as StaffRole, // object.keys returns string[]; we know it is a StaffRole
  );
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (): Promise<void> => {
    setIsLoading(true);
    setSelectedStudents([]);
    return dispatch(upgradeToStaff(selectedStudents, role))
      .then(() => {
        const roleLabel = sharedConstants.STAFF_ROLES[role];
        toast.success(
          intl.formatMessage(translations.upgradeSuccess, {
            count: selectedStudents.length,
            role: roleLabel,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.upgradeFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleNameChange = (_event, newValue): void => {
    setSelectedStudents(newValue);
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
      <Grid container flexDirection="row" alignItems="flex-end">
        <Autocomplete
          multiple
          disableCloseOnSelect
          id="upgrade-student-name"
          value={selectedStudents}
          onChange={handleNameChange}
          options={students}
          getOptionLabel={(option): string => option.name}
          // eslint-disable-next-line @typescript-eslint/no-shadow
          renderOption={(props, option, { selected }): JSX.Element => (
            <Box component="li" {...props} key={option.id}>
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
          sx={{ minWidth: '300px', maxWidth: '450px', marginRight: '12px' }}
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
          {Object.keys(sharedConstants.STAFF_ROLES).map((role) => (
            <MenuItem key={`upgrade-student-role-${role}`} value={role}>
              {sharedConstants.STAFF_ROLES[role]}
            </MenuItem>
          ))}
        </TextField>
        <LoadingButton
          disabled={selectedStudents.length === 0}
          loading={isLoading}
          variant="contained"
          onClick={onSubmit}
          style={{ marginTop: '4px' }}
        >
          {intl.formatMessage(translations.upgradeButton)}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default injectIntl(UpgradeToStaff);
