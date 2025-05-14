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
    label={<FormattedMessage {...translations[user.groupRole]} />}
    style={{
      width: 100,
      height: 25,
      backgroundColor: palette.groupRole[user.groupRole],
      marginRight: 5,
    }}
  />
);

export default GroupRoleChip;
