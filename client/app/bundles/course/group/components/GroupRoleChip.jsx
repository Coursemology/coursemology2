import { Chip } from '@mui/material';
import palette from 'theme/palette';

import { memberShape } from '../propTypes';

const groupRoleTranslation = {
  normal: 'Member',
  manager: 'Manager',
};

const translateStatus = (oldStatus) => {
  switch (oldStatus) {
    case 'normal':
      return groupRoleTranslation.normal;
    case 'manager':
      return groupRoleTranslation.manager;
    default:
      return groupRoleTranslation.unknown;
  }
};

const GroupRoleChip = ({ user }) => (
  <Chip
    label={translateStatus(user.groupRole)}
    style={{
      width: 100,
      height: 25,
      backgroundColor: palette.groupRole[user.groupRole],
      marginRight: 5,
    }}
  />
);

GroupRoleChip.propTypes = {
  user: memberShape.isRequired,
};

export default GroupRoleChip;
