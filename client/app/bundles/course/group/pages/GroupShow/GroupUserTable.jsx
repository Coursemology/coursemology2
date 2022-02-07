import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  CardHeader,
  CardText,
  Checkbox,
  Divider,
  DropDownMenu,
  IconButton,
  List,
  ListItem,
  MenuItem,
  RaisedButton,
  Subheader,
  TextField,
} from 'material-ui';
import Icon from 'material-ui/svg-icons/action/compare-arrows';
import {
  grey400,
  red100,
  green100,
  green300,
  blue100,
  blue300,
  red500,
} from 'material-ui/styles/colors';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { courseUserShape, groupShape } from '../../propTypes';
import actionTypes, { dialogTypes } from '../../constants';
import { sortByGroupRole, sortByName } from '../../utils/sort';
import translations from './translations.intl';
import { deleteGroup, updateGroup } from '../../actions';
import NameDescriptionForm from '../../forms/NameDescriptionForm';
import GroupFormDialog from '../../forms/GroupFormDialog';

const styles = {
  card: {
    marginTop: '2rem',
    width: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardHeaderFullWidthTitle: {
    width: '100%',
    paddingRight: 0,
  },
  cardContent: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  text: {
    paddingTop: 0,
    marginBottom: '2rem',
  },
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    marginRight: '1rem',
  },
  deleteButton: {
    height: 36,
    width: 36,
    padding: 6,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    border: 'solid 1px #d9d9d9',
    overflowY: 'scroll',
    height: 500,
  },
  header: {
    fontWeight: 'bold',
    fontSize: '2rem',
  },
  textField: {
    width: '100%',
    marginBottom: '0.5rem',
  },
  middleBar: {
    border: 'solid 1px #d9d9d9',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 3,
    height: 500,
  },
  checkbox: {
    marginTop: '1rem',
  },
  listItemWithDropdown: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    marginTop: '-0.5rem',
    marginBottom: '0.5rem',
  },
};

// Actually, the group can also be read from Redux. But for now, we'll get it from the parent.
const GroupUserTable = ({
  dispatch,
  categoryId,
  group,
  groups,
  originalGroup,
  courseUsers,
  intl,
}) => {
  const [hideInGroup, setHideInGroup] = useState(true);
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const originalMemberMap = new Map();
  originalGroup.members.forEach((m) => {
    originalMemberMap.set(m.id, m);
  });

  let availableUsers;
  if (hideInGroup) {
    const allGroupMemberIds = new Set(
      groups.flatMap((g) => g.members.map((m) => m.id)),
    );
    availableUsers = courseUsers.filter((cu) => !allGroupMemberIds.has(cu.id));
  } else {
    const groupMemberIds = new Set(group.members.map((m) => m.id));
    availableUsers = courseUsers.filter((cu) => !groupMemberIds.has(cu.id));
  }

  if (availableSearch) {
    const names = availableSearch
      .split(',')
      .map((n) => n.trim().toLocaleLowerCase())
      .filter((n) => n.length !== 0);
    availableUsers = availableUsers.filter((u) =>
      names.some((name) => u.name.toLocaleLowerCase().includes(name)),
    );
  }

  let groupMembers = group.members;

  if (selectedSearch) {
    const names = selectedSearch
      .split(',')
      .map((n) => n.trim().toLocaleLowerCase())
      .filter((n) => n.length !== 0);
    groupMembers = groupMembers.filter((u) =>
      names.some((name) => u.name.toLocaleLowerCase().includes(name)),
    );
  }

  const availableStudents = availableUsers.filter((u) => u.role === 'student');
  const availableStaff = availableUsers.filter((u) => u.role !== 'student');
  const selectedStudents = groupMembers.filter((m) => m.role === 'student');
  const selectedStaff = groupMembers.filter((m) => m.role !== 'student');

  const onFormSubmit = useCallback(
    (data) =>
      dispatch(
        updateGroup(
          categoryId,
          group.id,
          data,
          intl.formatMessage(translations.updateGroupSuccess, {
            groupName: group.name,
          }),
          intl.formatMessage(translations.updateGroupFailure, {
            groupName: group.name,
          }),
        ),
      ),
    [dispatch, group.name, group.id],
  );

  const handleEdit = useCallback(() => {
    dispatch({ type: actionTypes.UPDATE_GROUP_FORM_SHOW });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(
      deleteGroup(
        categoryId,
        group.id,
        intl.formatMessage(translations.deleteGroupSuccess, {
          groupName: group.name,
        }),
        intl.formatMessage(translations.deleteGroupFailure, {
          groupName: group.name,
        }),
      ),
    ).then(() => {
      setIsConfirmingDelete(false);
    });
  });

  const onCheck = (user) => {
    const newGroup = {
      ...group,
      members: [
        ...group.members,
        {
          ...user,
          groupRole: 'normal',
        },
      ],
    };
    newGroup.members.sort(sortByName).sort(sortByGroupRole);
    dispatch({
      type: actionTypes.MODIFY_GROUP,
      group: newGroup,
    });
  };

  const onUncheck = (user) => {
    const newGroup = {
      ...group,
      members: group.members.filter((m) => m.id !== user.id),
    };
    dispatch({
      type: actionTypes.MODIFY_GROUP,
      group: newGroup,
    });
  };

  const onChangeRole = (value, user) => {
    if (user.groupRole === value) return;
    const newGroup = {
      ...group,
      members: [
        ...group.members.filter((m) => m.id !== user.id),
        {
          ...user,
          groupRole: value,
        },
      ],
    };
    newGroup.members.sort(sortByName).sort(sortByGroupRole);
    dispatch({
      type: actionTypes.MODIFY_GROUP,
      group: newGroup,
    });
  };

  return (
    <>
      <Card style={styles.card} className="course-user-table">
        <CardHeader
          title={
            <div style={styles.cardHeader}>
              <h3 style={styles.title}>{group.name}</h3>
              <div style={styles.buttonsContainer}>
                <RaisedButton
                  label={<FormattedMessage {...translations.editGroup} />}
                  onClick={handleEdit}
                  primary
                  style={styles.editButton}
                />
                <IconButton
                  tooltip="Delete Group"
                  onClick={() => setIsConfirmingDelete(true)}
                  style={styles.deleteButton}
                >
                  <DeleteIcon color={red500} />
                </IconButton>
              </div>
            </div>
          }
          subtitle={
            <FormattedMessage
              values={{ numMembers: group.members?.length ?? 0 }}
              {...translations.groupHeaderSubtitle}
            />
          }
          textStyle={styles.cardHeaderFullWidthTitle}
        />
        <CardText style={styles.text}>
          <p style={{ marginBottom: '2rem' }}>
            {group.description ?? (
              <FormattedMessage {...translations.noDescription} />
            )}
          </p>
          <div style={styles.cardContent}>
            <div style={{ ...styles.listContainer, marginRight: '1rem' }}>
              <div style={styles.header}>Users that can be added</div>
              <TextField
                style={styles.textField}
                hintText="Search by Name (separate by comma to search multiple)"
                value={availableSearch}
                onChange={(_, value) => setAvailableSearch(value)}
              />
              <List style={styles.list}>
                {availableStudents.length === 0 &&
                availableStaff.length === 0 ? (
                  <ListItem
                    style={{ color: 'grey' }}
                    primaryText="No users found"
                  />
                ) : null}
                {availableStudents.length > 0 && (
                  <>
                    <Subheader>Students</Subheader>
                    {availableStudents.map((u) => (
                      <ListItem
                        primaryText={u.name}
                        key={u.id}
                        style={
                          originalMemberMap.has(u.id)
                            ? { backgroundColor: red100 }
                            : {}
                        }
                        leftCheckbox={<Checkbox onCheck={() => onCheck(u)} />}
                      />
                    ))}
                  </>
                )}
                {availableStaff.length > 0 && (
                  <>
                    {availableStudents.length > 0 && <Divider />}
                    <Subheader>Staff</Subheader>
                    {availableStaff.map((u) => (
                      <ListItem
                        primaryText={u.name}
                        key={u.id}
                        style={
                          originalMemberMap.has(u.id)
                            ? { backgroundColor: red100 }
                            : {}
                        }
                        leftCheckbox={<Checkbox onCheck={() => onCheck(u)} />}
                      />
                    ))}
                  </>
                )}
              </List>
            </div>
            <div style={styles.middleBar}>
              <Icon />
            </div>
            <div style={{ ...styles.listContainer, marginLeft: '1rem' }}>
              <div style={styles.header}>Users in group</div>
              <TextField
                style={styles.textField}
                hintText="Search by Name (separate by comma to search multiple)"
                value={selectedSearch}
                onChange={(_, value) => setSelectedSearch(value)}
              />
              <List style={styles.list}>
                {selectedStudents.length === 0 && selectedStaff.length === 0 ? (
                  <ListItem
                    style={{ color: grey400 }}
                    primaryText="No users found"
                  />
                ) : null}
                {selectedStudents.length > 0 && (
                  <>
                    <Subheader>Students</Subheader>
                    {selectedStudents.map((u) => {
                      const isAdded = !originalMemberMap.has(u.id);
                      const roleHasChanged =
                        !isAdded &&
                        originalMemberMap.get(u.id).groupRole !== u.groupRole;
                      return (
                        <ListItem
                          className="right-list-item"
                          primaryText={
                            <div style={styles.listItemWithDropdown}>
                              <div>{u.name}</div>
                              <DropDownMenu
                                style={styles.dropdown}
                                value={u.groupRole}
                                onChange={(_, _2, value) =>
                                  onChangeRole(value, u)
                                }
                                underlineStyle={
                                  // eslint-disable-next-line no-nested-ternary
                                  isAdded
                                    ? { borderTopColor: green300 }
                                    : roleHasChanged
                                    ? { fill: blue300 }
                                    : {}
                                }
                                iconStyle={
                                  // eslint-disable-next-line no-nested-ternary
                                  isAdded
                                    ? { fill: green300 }
                                    : roleHasChanged
                                    ? { fill: blue300 }
                                    : {}
                                }
                              >
                                <MenuItem value="normal" primaryText="Normal" />
                                <MenuItem
                                  value="manager"
                                  primaryText="Manager"
                                />
                              </DropDownMenu>
                            </div>
                          }
                          key={u.id}
                          leftCheckbox={
                            <Checkbox checked onCheck={() => onUncheck(u)} />
                          }
                          style={
                            // eslint-disable-next-line no-nested-ternary
                            isAdded
                              ? { backgroundColor: green100 }
                              : roleHasChanged
                              ? { backgroundColor: blue100 }
                              : {}
                          }
                        />
                      );
                    })}
                  </>
                )}
                {selectedStaff.length > 0 && (
                  <>
                    {selectedStudents.length > 0 && <Divider />}
                    <Subheader>Staff</Subheader>
                    {selectedStaff.map((u) => {
                      const isAdded = !originalMemberMap.has(u.id);
                      const roleHasChanged =
                        !isAdded &&
                        originalMemberMap.get(u.id).groupRole !== u.groupRole;
                      return (
                        <ListItem
                          className="right-list-item"
                          primaryText={
                            <div style={styles.listItemWithDropdown}>
                              <div>{u.name}</div>
                              <DropDownMenu
                                style={styles.dropdown}
                                value={u.groupRole}
                                onChange={(_, _2, value) =>
                                  onChangeRole(value, u)
                                }
                                underlineStyle={
                                  // eslint-disable-next-line no-nested-ternary
                                  isAdded
                                    ? { borderTopColor: green300 }
                                    : roleHasChanged
                                    ? { fill: blue300 }
                                    : {}
                                }
                                iconStyle={
                                  // eslint-disable-next-line no-nested-ternary
                                  isAdded
                                    ? { fill: green300 }
                                    : roleHasChanged
                                    ? { fill: blue300 }
                                    : {}
                                }
                              >
                                <MenuItem value="normal" primaryText="Normal" />
                                <MenuItem
                                  value="manager"
                                  primaryText="Manager"
                                />
                              </DropDownMenu>
                            </div>
                          }
                          key={u.id}
                          leftCheckbox={
                            <Checkbox checked onCheck={() => onUncheck(u)} />
                          }
                          style={
                            // eslint-disable-next-line no-nested-ternary
                            isAdded
                              ? { backgroundColor: green100 }
                              : roleHasChanged
                              ? { backgroundColor: blue100 }
                              : {}
                          }
                        />
                      );
                    })}
                  </>
                )}
              </List>
            </div>
          </div>
          <Checkbox
            label="Hide students who are already in a group under this category"
            style={styles.checkbox}
            checked={hideInGroup}
            onCheck={(_, value) => setHideInGroup(value)}
          />
        </CardText>
      </Card>
      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.editGroupHeader)}
        expectedDialogTypes={[dialogTypes.UPDATE_GROUP]}
      >
        <NameDescriptionForm
          onSubmit={onFormSubmit}
          initialValues={{
            name: group.name,
            description: group.description,
          }}
        />
      </GroupFormDialog>
      <ConfirmationDialog
        confirmDiscard={!isConfirmingDelete}
        confirmDelete={isConfirmingDelete}
        open={isConfirmingDelete}
        onCancel={() => {
          setIsConfirmingDelete(false);
        }}
        onConfirm={() => {
          handleDelete();
        }}
      />
    </>
  );
};

GroupUserTable.propTypes = {
  categoryId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  dispatch: PropTypes.func.isRequired,
  group: groupShape.isRequired,
  groups: PropTypes.arrayOf(groupShape).isRequired,
  originalGroup: groupShape,
  courseUsers: PropTypes.arrayOf(courseUserShape).isRequired,
  intl: intlShape,
};

export default connect((state) => ({
  courseUsers: state.groupsManage.courseUsers,
  originalGroup: state.groupsFetch.groups.find(
    (g) => g.id === state.groupsManage.selectedGroupId,
  ),
}))(injectIntl(GroupUserTable));
