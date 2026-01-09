import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  COURSE_STAFF_ROLES,
  CourseStaffRole,
  CourseUserBasicMiniEntity,
} from 'types/course/courseUsers';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

import { upgradeToStaff } from '../../operations';
import { getStudentOptionMiniEntities } from '../../selectors';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const translations = defineMessages({
  upgradeSuccess: {
    id: 'course.users.UpgradeToStaff.upgradeSuccess',
    defaultMessage:
      '{count, plural, =0 {No users were} one {# new user has} other {# new users have}} been upgraded to {role}',
  },
  upgradeFailure: {
    id: 'course.users.UpgradeToStaff.upgradeFailure',
    defaultMessage: 'Failed to update user - {error}',
  },
  upgradeHeader: {
    id: 'course.users.UpgradeToStaff.upgradeHeader',
    defaultMessage: 'Upgrade Student',
  },
  upgradeButton: {
    id: 'course.users.UpgradeToStaff.upgradeButton',
    defaultMessage: 'Upgrade to staff',
  },
});

const UpgradeToStaff: FC = () => {
  const { t } = useTranslation();

  const students = useAppSelector(getStudentOptionMiniEntities);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<
    CourseUserBasicMiniEntity[]
  >([]);
  const [role, setRole] = useState<CourseStaffRole>('teaching_assistant');
  const dispatch = useAppDispatch();

  const onSubmit = (): Promise<void> => {
    setIsLoading(true);
    setSelectedStudents([]);
    return dispatch(upgradeToStaff(selectedStudents, role))
      .then(() => {
        toast.success(
          t(translations.upgradeSuccess, {
            count: selectedStudents.length,
            role: t(roleTranslations[role]),
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.upgradeFailure, {
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
    <div style={{ padding: '12px 24px 24px 24px', margin: '12px 0px' }}>
      <Typography sx={{ marginBottom: '24px' }} variant="h6">
        {t(translations.upgradeHeader)}
      </Typography>
      <Grid alignItems="flex-end" container flexDirection="row">
        <Autocomplete
          disableCloseOnSelect
          getOptionLabel={(option): string => option.name}
          id="upgrade-student-name"
          multiple
          onChange={handleNameChange}
          options={students}
          renderInput={(params): JSX.Element => (
            <TextField
              {...params}
              label={t(tableTranslations.name)}
              variant="standard"
            />
          )}
          renderOption={(optionProps, option, { selected }): JSX.Element => (
            <Box component="li" {...optionProps} key={option.id}>
              <Checkbox
                checked={selected}
                checkedIcon={checkedIcon}
                icon={icon}
                style={{ marginRight: 8 }}
              />
              {option.name}
            </Box>
          )}
          sx={{ minWidth: '300px', maxWidth: '450px', marginRight: '12px' }}
          value={selectedStudents}
        />
        <TextField
          id="upgrade-student-role"
          label={t(tableTranslations.role)}
          onChange={handleRoleChange}
          select
          sx={{ minWidth: '300px', marginRight: '12px' }}
          value={role}
          variant="standard"
        >
          {COURSE_STAFF_ROLES.map((roleValue) => (
            <MenuItem
              key={`upgrade-student-role-${roleValue}`}
              value={roleValue}
            >
              {t(roleTranslations[roleValue])}
            </MenuItem>
          ))}
        </TextField>
        <LoadingButton
          disabled={selectedStudents.length === 0}
          loading={isLoading}
          onClick={onSubmit}
          style={{ marginTop: '4px' }}
          variant="contained"
        >
          {t(translations.upgradeButton)}
        </LoadingButton>
      </Grid>
    </div>
  );
};

export default UpgradeToStaff;
