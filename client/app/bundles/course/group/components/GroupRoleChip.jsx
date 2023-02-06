import { defineMessages, FormattedMessage } from 'react-intl';
import { Chip } from '@mui/material';
import palette from 'theme/palette';

import { memberShape } from '../propTypes';

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

const GroupRoleChip = ({ user }) => (
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

GroupRoleChip.propTypes = {
  user: memberShape.isRequired,
};

export default GroupRoleChip;
