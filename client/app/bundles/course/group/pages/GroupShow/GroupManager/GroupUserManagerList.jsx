import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

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

const GroupUserManagerListItem = ({
  user,
  colour,
  onCheck,
  showDropdown,
  onChangeDropdown,
  isChecked,
}) => (
  <ListItem
    button
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
      </ListItemText>
    </div>

    {showDropdown ? (
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
    ) : null}
  </ListItem>
);

GroupUserManagerListItem.propTypes = {
  user: memberShape.isRequired,
  colour: PropTypes.object,
  onCheck: PropTypes.func.isRequired,
  showDropdown: PropTypes.bool,
  onChangeDropdown: PropTypes.func,
  isChecked: PropTypes.bool,
};

const GroupUserManagerList = ({
  students = [],
  staff = [],
  onCheck,
  colourMap,
  showDropdown = false,
  onChangeDropdown,
  isChecked = false,
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
            onChangeDropdown={onChangeDropdown}
            onCheck={onCheck}
            showDropdown={showDropdown}
            user={user}
          />
        );
      })}
    </>
  );

  return (
    <List style={styles.list}>
      {students.length === 0 && staff.length === 0 ? (
        <ListItem button style={{ color: grey[400] }}>
          <ListItemText>
            <FormattedMessage {...translations.noUsersFound} />
          </ListItemText>
        </ListItem>
      ) : null}

      {students.length > 0 &&
        renderUsersListItems(students, translations.students)}

      {staff.length > 0 && renderUsersListItems(staff, translations.staff)}
    </List>
  );
};

GroupUserManagerList.propTypes = {
  students: PropTypes.arrayOf(memberShape),
  staff: PropTypes.arrayOf(memberShape),
  onCheck: PropTypes.func.isRequired,
  colourMap: PropTypes.object.isRequired,
  showDropdown: PropTypes.bool,
  onChangeDropdown: PropTypes.func,
  isChecked: PropTypes.bool,
};

export default GroupUserManagerList;
