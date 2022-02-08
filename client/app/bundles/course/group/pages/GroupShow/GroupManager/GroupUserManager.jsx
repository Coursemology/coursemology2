import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox, TextField } from 'material-ui';
import Icon from 'material-ui/svg-icons/action/compare-arrows';
import {
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
import { courseUserShape, groupShape } from '../../../propTypes';
import actionTypes, { dialogTypes } from '../../../constants';
import { sortByGroupRole, sortByName } from '../../../utils/sort';
import translations from '../translations.intl';
import { deleteGroup, updateGroup } from '../../../actions';
import NameDescriptionForm from '../../../forms/NameDescriptionForm';
import GroupFormDialog from '../../../forms/GroupFormDialog';
import GroupCard from '../../../components/GroupCard';
import GroupUserManagerList from './GroupUserManagerList';

const styles = {
  listContainerContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  listContainer: {
    flex: 1,
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
};

const filterByName = (search, users) => {
  if (!search) {
    return users;
  }
  const names = search
    .split(',')
    .map((n) => n.trim().toLocaleLowerCase())
    .filter((n) => n.length !== 0);
  return users.filter((u) =>
    names.some((name) => u.name.toLocaleLowerCase().includes(name)),
  );
};

const getAvailableUsers = (
  courseUsers,
  groups,
  group,
  hideInGroup,
  availableSearch,
) => {
  if (hideInGroup) {
    const allGroupMemberIds = new Set(
      groups.flatMap((g) => g.members.map((m) => m.id)),
    );
    return filterByName(
      availableSearch,
      courseUsers.filter((cu) => !allGroupMemberIds.has(cu.id)),
    );
  }
  const groupMemberIds = new Set(group.members.map((m) => m.id));
  return filterByName(
    availableSearch,
    courseUsers.filter((cu) => !groupMemberIds.has(cu.id)),
  );
};

// Actually, the group can also be read from Redux. But for now, we'll get it from the parent.
const GroupUserManager = ({
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

  const availableUsers = useMemo(
    () =>
      getAvailableUsers(
        courseUsers,
        groups,
        group,
        hideInGroup,
        availableSearch,
      ),
    [courseUsers, groups, group, hideInGroup, availableSearch],
  );
  const groupMembers = useMemo(
    () => filterByName(selectedSearch, group.members),
    [selectedSearch, group.members],
  );

  const availableStudents = useMemo(
    () => availableUsers.filter((u) => u.role === 'student'),
    [availableUsers],
  );
  const availableStaff = useMemo(
    () => availableUsers.filter((u) => u.role !== 'student'),
    [availableUsers],
  );
  const selectedStudents = useMemo(
    () => groupMembers.filter((m) => m.role === 'student'),
    [groupMembers],
  );
  const selectedStaff = useMemo(
    () => groupMembers.filter((m) => m.role !== 'student'),
    [groupMembers],
  );

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
    [dispatch, categoryId, group.name, group.id],
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
  }, [dispatch, categoryId, group.id, group.name, setIsConfirmingDelete]);

  const onCheck = useCallback(
    (user) => {
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
    },
    [dispatch, group],
  );

  const onUncheck = useCallback(
    (user) => {
      const newGroup = {
        ...group,
        members: group.members.filter((m) => m.id !== user.id),
      };
      dispatch({
        type: actionTypes.MODIFY_GROUP,
        group: newGroup,
      });
    },
    [dispatch, group],
  );

  const onChangeRole = useCallback(
    (value, user) => {
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
    },
    [dispatch, group],
  );

  const originalMemberMap = useMemo(() => {
    const result = new Map();
    originalGroup.members.forEach((m) => {
      result.set(m.id, m);
    });
    return result;
  }, [originalGroup.members]);

  const titleButtons = useMemo(
    () => [
      {
        label: <FormattedMessage {...translations.editGroup} />,
        onClick: handleEdit,
      },
      {
        label: 'Delete Group',
        onClick: () => setIsConfirmingDelete(true),
        icon: <DeleteIcon color={red500} />,
      },
    ],
    [handleEdit, setIsConfirmingDelete],
  );

  const colours = useMemo(() => {
    const result = {};
    [...availableStudents, ...availableStaff].forEach((u) => {
      if (originalMemberMap.has(u.id)) {
        result[u.id] = { light: red100 };
      }
    });
    [...selectedStudents, ...selectedStaff].forEach((u) => {
      if (!originalMemberMap.has(u.id)) {
        result[u.id] = { light: green100, dark: green300 };
      } else if (originalMemberMap.get(u.id).groupRole !== u.groupRole) {
        result[u.id] = { light: blue100, dark: blue300 };
      }
    });
    return result;
  }, [
    availableStudents,
    availableStaff,
    selectedStudents,
    selectedStaff,
    originalMemberMap,
  ]);

  return (
    <>
      <GroupCard
        className="group-user-manager"
        title={group.name}
        subtitle={
          <FormattedMessage
            values={{ numMembers: group.members?.length ?? 0 }}
            {...translations.groupHeaderSubtitle}
          />
        }
        titleButtons={titleButtons}
      >
        <p style={{ marginBottom: '2rem' }}>
          {group.description ?? (
            <FormattedMessage {...translations.noDescription} />
          )}
        </p>
        <div style={styles.listContainerContainer}>
          <div style={{ ...styles.listContainer, marginRight: '1rem' }}>
            <div style={styles.header}>Users that can be added</div>
            <TextField
              style={styles.textField}
              hintText="Search by Name (separate by comma to search multiple)"
              value={availableSearch}
              onChange={(_, value) => setAvailableSearch(value)}
            />
            <GroupUserManagerList
              students={availableStudents}
              staff={availableStaff}
              onCheck={onCheck}
              colourMap={colours}
            />
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
            <GroupUserManagerList
              students={selectedStudents}
              staff={selectedStaff}
              onCheck={onUncheck}
              colourMap={colours}
              showDropdown
              onChangeDropdown={onChangeRole}
              isChecked
            />
          </div>
        </div>
        <Checkbox
          label="Hide students who are already in a group under this category"
          style={styles.checkbox}
          checked={hideInGroup}
          onCheck={(_, value) => setHideInGroup(value)}
        />
      </GroupCard>

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

GroupUserManager.propTypes = {
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
}))(injectIntl(GroupUserManager));
