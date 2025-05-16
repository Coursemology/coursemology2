import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Chip } from '@mui/material';
import palette from 'theme/palette';

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

const GroupRoleChip: FC<GroupRoleChipProps> = ({ user }) => (
  <Chip
    className={`w-40 h-10 ${palette.groupRole[user.groupRole]} mr-2`}
    label={<FormattedMessage {...translations[user.groupRole]} />}
  />
);

export default GroupRoleChip;
