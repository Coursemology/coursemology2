import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Checkbox,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import GroupRoleChip from 'course/group/components/GroupRoleChip';
import GhostIcon from 'lib/components/icons/GhostIcon';

import { memberShape } from '../../../propTypes';

const translations = defineMessages({
  normal: {
    id: 'course.group.GroupShow.GroupManager.GroupUserManagerList.normal',
    defaultMessage: 'Member',
  },
  manager: {
    id: 'course.group.GroupShow.GroupManager.GroupUserManagerList.manager',
    defaultMessage: 'Manager',
  },
  noUsersFound: {
    id: 'course.group.GroupShow.GroupManager.GroupUserManagerList.noUsersFound',
    defaultMessage: 'No users found',
  },
  students: {
    id: 'course.group.GroupShow.GroupManager.GroupUserManagerList.students',
    defaultMessage: 'Students',
  },
  staff: {
    id: 'course.group.GroupShow.GroupManager.GroupUserManagerList.staff',
    defaultMessage: 'Staff',
  },
  otherGroupMembers: {
    id: 'course.group.GroupShow.GroupManager.GroupUserManagerList.otherGroupMembers',
    defaultMessage: '(existing member of the group(s): {groups})',
  },
});

const styles = {
  list: {
    border: 'solid 1px #d9d9d9',
    overflowY: 'scroll',
    height: 500,
    paddingTop: 0,
    paddingBottom: 0,
  },
  listSubheader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  listItem: {
    height: 36,
    marginTop: 6,
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
  },
  listItemWithDropdown: {
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    marginBottom: 5,
  },
  listItemTextSize: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
  },
  listItemLabel: {
    display: 'flex',
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 24,
    paddingRight: 16,
  },
  checkbox: {
    width: 'auto',
    padding: 0,
  },
};

const GroupUserManagerListItemChoice = ({
  isListUserOfNonGroupMember,
  user,
  onChangeDropdown,
}) => {
  if (isListUserOfNonGroupMember || !user.groupRole) return null;
  return user.role === 'student' ? (
    <GroupRoleChip user={user} />
  ) : (
    <div style={styles.listItemWithDropdown}>
      <Select
        onChange={(event) => onChangeDropdown(event.target.value, user)}
        onClick={() => {}}
        style={styles.listItemTextSize}
        value={user.groupRole}
        variant="standard"
      >
        <MenuItem style={styles.listItemTextSize} value="normal">
          <FormattedMessage {...translations.normal} />
        </MenuItem>
        <MenuItem style={styles.listItemTextSize} value="manager">
          <FormattedMessage {...translations.manager} />
        </MenuItem>
      </Select>
    </div>
  );
};

GroupUserManagerListItemChoice.propTypes = {
  isListUserOfNonGroupMember: PropTypes.bool,
  user: memberShape.isRequired,
  onChangeDropdown: PropTypes.func,
};

const GroupUserManagerListItem = ({
  user,
  colour,
  otherGroups,
  onCheck,
  onChangeDropdown,
  showDropdown,
  isChecked,
  isListUserOfNonGroupMember,
}) => (
  <ListItemButton
    disablePadding
    style={
      colour
        ? { ...styles.listItem, backgroundColor: colour.light }
        : styles.listItem
    }
  >
    <div onClick={() => onCheck(user)} style={styles.listItemLabel}>
      <Checkbox
        checked={isChecked}
        onChange={() => onCheck(user)}
        style={styles.checkbox}
      />

      <ListItemText primaryTypographyProps={{ style: styles.listItemTextSize }}>
        {user.name}
        {user.isPhantom && <GhostIcon />}
        &nbsp;
        {otherGroups?.size > 0 && (
          <FormattedMessage
            {...translations.otherGroupMembers}
            values={{ groups: otherGroups.join(', ') }}
          />
        )}
      </ListItemText>
    </div>

    {showDropdown && (
      <GroupUserManagerListItemChoice
        isListUserOfNonGroupMember={isListUserOfNonGroupMember}
        onChangeDropdown={onChangeDropdown}
        user={user}
      />
    )}
  </ListItemButton>
);

GroupUserManagerListItem.propTypes = {
  user: memberShape.isRequired,
  colour: PropTypes.object,
  otherGroups: PropTypes.arrayOf(PropTypes.string),
  onCheck: PropTypes.func.isRequired,
  onChangeDropdown: PropTypes.func,
  showDropdown: PropTypes.bool,
  isChecked: PropTypes.bool,
  isListUserOfNonGroupMember: PropTypes.bool,
};

const GroupUserManagerList = ({
  students = [],
  staff = [],
  memberOtherGroups = {},
  onCheck,
  colourMap,
  showDropdown = false,
  onChangeDropdown,
  isChecked = false,
  isListUserOfNonGroupMember = false,
}) => {
  const renderUsersListItems = (users, title) => (
    <>
      <ListSubheader style={styles.listSubheader}>
        <Checkbox
          checked={isChecked}
          onChange={() => onCheck(users)}
          style={styles.checkbox}
        />

        <FormattedMessage {...title} />
      </ListSubheader>

      {users.map((user) => {
        const colour = colourMap[user.id];
        return (
          <GroupUserManagerListItem
            key={user.id}
            colour={colour}
            isChecked={isChecked}
            isListUserOfNonGroupMember={isListUserOfNonGroupMember}
            onChangeDropdown={onChangeDropdown}
            onCheck={onCheck}
            otherGroups={memberOtherGroups[user.id.toString()]}
            showDropdown={showDropdown}
            user={user}
          />
        );
      })}
    </>
  );

  return (
    <List style={styles.list}>
      {students.length === 0 && staff.length === 0 && (
        <ListItemButton style={{ color: grey[400] }}>
          <ListItemText>
            <FormattedMessage {...translations.noUsersFound} />
          </ListItemText>
        </ListItemButton>
      )}

      {students.length > 0 &&
        renderUsersListItems(students, translations.students)}

      {staff.length > 0 && renderUsersListItems(staff, translations.staff)}
    </List>
  );
};

GroupUserManagerList.propTypes = {
  students: PropTypes.arrayOf(memberShape),
  staff: PropTypes.arrayOf(memberShape),
  memberOtherGroups: PropTypes.arrayOf(memberShape),
  onCheck: PropTypes.func.isRequired,
  colourMap: PropTypes.object.isRequired,
  showDropdown: PropTypes.bool,
  onChangeDropdown: PropTypes.func,
  isChecked: PropTypes.bool,
  isListUserOfNonGroupMember: PropTypes.bool,
};

export default GroupUserManagerList;
