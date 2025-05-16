import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Chip } from '@mui/material';
import palette from 'theme/palette';

import useTranslation from 'lib/hooks/useTranslation';

import { GroupMember } from '../types';

const translations = defineMessages({
  manager: {
    id: 'course.group.GroupShow.GroupRoleChip.manager',
    defaultMessage: 'Manager',
  },
  normal: {
    id: 'course.group.GroupRoleChip.normal',
    defaultMessage: 'Member',
  },
});

interface GroupRoleChipProps {
  user: GroupMember;
}

const GroupRoleChip: FC<GroupRoleChipProps> = ({ user }) => {
  const { t } = useTranslation();
  return (
    <Chip
      className={`w-40 h-10 ${palette.groupRole[user.groupRole]} mr-2`}
      label={t(translations[user.groupRole])}
    />
  );
};

export default GroupRoleChip;
