import { memo } from 'react';
import { MenuItem, TextField } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  COURSE_USER_ROLES,
  CourseUserMiniEntity,
  CourseUserRole,
} from 'types/course/courseUsers';

import { updateUser } from 'bundles/course/users/operations';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import roleTranslations from 'lib/translations/course/users/roles';

import translations from './translations';

interface RoleMenuProps {
  for: CourseUserMiniEntity;
}

const RoleMenu = (props: RoleMenuProps): JSX.Element => {
  const { for: user } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const roles = COURSE_USER_ROLES.map((option) => (
    <MenuItem key={option} id={option} value={option}>
      {t(roleTranslations[option])}
    </MenuItem>
  ));

  const handleRoleUpdate = (role: CourseUserRole): void => {
    dispatch(updateUser(user.id, { role }))
      .then(() => {
        toast.success(
          t(translations.changeRoleSuccess, {
            name: user.name,
            role: t(roleTranslations[role]),
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.changeRoleFailure, {
            name: user.name,
            role: t(roleTranslations[role]),
            error: error.response?.data?.errors ?? '',
          }),
        );
      });
  };

  return (
    <TextField
      key={user.id}
      className="course_user_role"
      InputProps={{ disableUnderline: true }}
      onChange={(e): void => handleRoleUpdate(e.target.value as CourseUserRole)}
      select
      value={user.role}
      variant="standard"
    >
      {roles}
    </TextField>
  );
};

export default memo(RoleMenu, (prevProps, nextProps) =>
  equal(prevProps.for.role, nextProps.for.role),
);
