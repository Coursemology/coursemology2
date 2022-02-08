import React from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox,
  Divider,
  DropDownMenu,
  List,
  ListItem,
  MenuItem,
  Subheader,
} from 'material-ui';
import { grey400 } from 'material-ui/styles/colors';
import { memberShape } from '../../../propTypes';

const styles = {
  list: {
    border: 'solid 1px #d9d9d9',
    overflowY: 'scroll',
    height: 500,
  },
  listItem: {
    height: 36,
    fontSize: 13,
    paddingTop: 6,
    paddingBottom: 6,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  listItemWithDropdown: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkbox: {
    top: 6,
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
    className={showDropdown ? 'has-dropdown' : ''}
    primaryText={
      showDropdown ? (
        <div style={styles.listItemWithDropdown}>
          <div>{user.name}</div>
          <DropDownMenu
            className="group-user-manager-list-item-dropdown"
            value={user.groupRole}
            onChange={(_, _2, value) => onChangeDropdown(value, user)}
            underlineStyle={
              colour ? { borderTopColor: colour.dark } : undefined
            }
            iconStyle={colour ? { fill: colour.light } : undefined}
          >
            <MenuItem value="normal" primaryText="Normal" />
            <MenuItem value="manager" primaryText="Manager" />
          </DropDownMenu>
        </div>
      ) : (
        <div>{user.name}</div>
      )
    }
    leftCheckbox={
      <Checkbox
        style={styles.checkbox}
        checked={isChecked}
        onCheck={() => onCheck(user)}
      />
    }
    style={
      colour
        ? { ...styles.listItem, backgroundColor: colour.light }
        : styles.listItem
    }
  />
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
      <ListItem style={{ color: grey400 }} primaryText="No users found" />
    ) : null}
    {students.length > 0 && (
      <>
        <Subheader>Students</Subheader>
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
        <Subheader>Staff</Subheader>
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
