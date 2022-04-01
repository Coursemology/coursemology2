import PropTypes from 'prop-types';
import {
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { defineMessages, FormattedMessage } from 'react-intl';
import { memberShape } from '../../../propTypes';

const translations = defineMessages({
  normal: {
    id: 'course.group.show.groupUserManagerList.normal',
    defaultMessage: 'Member',
  },
  manager: {
    id: 'course.group.show.groupUserManagerList.manager',
    defaultMessage: 'Manager',
  },
  noUsersFound: {
    id: 'course.group.show.groupUserManagerList.noUsersFound',
    defaultMessage: 'No users found',
  },
  students: {
    id: 'course.group.show.groupUserManagerList.students',
    defaultMessage: 'Students',
  },
  staff: {
    id: 'course.group.show.groupUserManagerList.staff',
    defaultMessage: 'Staff',
  },
});

const styles = {
  list: {
    border: 'solid 1px #d9d9d9',
    overflowY: 'scroll',
    height: 500,
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
    marginBottm: 5,
  },
  listItemTextSize: {
    fontSize: 13,
  },
  checkbox: {
    width: 'auto',
    padding: 0,
  },
  divider: {
    marginTop: 16,
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
    className={showDropdown ? 'has-dropdown' : ''}
    style={
      colour
        ? { ...styles.listItem, backgroundColor: colour.light }
        : styles.listItem
    }
  >
    <Checkbox
      checked={isChecked}
      onChange={() => onCheck(user)}
      style={styles.checkbox}
    />
    <ListItemText
      style={styles.listItemText}
      primaryTypographyProps={{ style: styles.listItemTextSize }}
    >
      {showDropdown ? (
        <div style={styles.listItemWithDropdown}>
          <div onClick={() => onCheck(user)}>{user.name}</div>
          <Select
            className="group-user-manager-list-item-dropdown"
            onChange={(event) => onChangeDropdown(event.target.value, user)}
            value={user.groupRole}
            style={styles.listItemTextSize}
            variant="standard"
          >
            <MenuItem value="normal" style={styles.listItemTextSize}>
              <FormattedMessage {...translations.normal} />
            </MenuItem>
            <MenuItem value="manager" style={styles.listItemTextSize}>
              <FormattedMessage {...translations.manager} />
            </MenuItem>
          </Select>
        </div>
      ) : (
        <div onClick={() => onCheck(user)}>{user.name}</div>
      )}
    </ListItemText>
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
}) => (
  <List style={styles.list}>
    {students.length === 0 && staff.length === 0 ? (
      <ListItem button style={{ color: grey[400] }}>
        <ListItemText>
          <FormattedMessage {...translations.noUsersFound} />
        </ListItemText>
      </ListItem>
    ) : null}
    {students.length > 0 && (
      <>
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.students} />
        </ListSubheader>
        {students.map((user) => {
          const colour = colourMap[user.id];
          return (
            <GroupUserManagerListItem
              key={user.id}
              user={user}
              colour={colour}
              onCheck={onCheck}
              showDropdown={showDropdown}
              onChangeDropdown={onChangeDropdown}
              isChecked={isChecked}
            />
          );
        })}
      </>
    )}
    {staff.length > 0 && (
      <>
        {students.length > 0 && <Divider style={styles.divider} />}
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.staff} />
        </ListSubheader>
        {staff.map((user) => {
          const colour = colourMap[user.id];
          return (
            <GroupUserManagerListItem
              key={user.id}
              user={user}
              colour={colour}
              onCheck={onCheck}
              showDropdown={showDropdown}
              onChangeDropdown={onChangeDropdown}
              isChecked={isChecked}
            />
          );
        })}
      </>
    )}
  </List>
);

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
