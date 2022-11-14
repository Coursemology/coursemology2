import { useCallback, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import CompareArrows from '@mui/icons-material/CompareArrows';
import Delete from '@mui/icons-material/Delete';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import { deleteGroup, updateGroup } from '../../../actions';
import GroupCard from '../../../components/GroupCard';
import actionTypes, { dialogTypes } from '../../../constants';
import GroupFormDialog from '../../../forms/GroupFormDialog';
import NameDescriptionForm from '../../../forms/NameDescriptionForm';
import { courseUserShape, groupShape } from '../../../propTypes';
import { sortByGroupRole, sortByName } from '../../../utils/sort';

import GroupUserManagerList from './GroupUserManagerList';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.group.show.groupUserManager.update.success',
    defaultMessage: '{groupName} was successfully updated.',
  },
  updateFailure: {
    id: 'course.group.show.groupUserManager.update.fail',
    defaultMessage: 'Failed to update {groupName}.',
  },
  deleteSuccess: {
    id: 'course.group.show.groupUserManager.delete.success',
    defaultMessage: '{groupName} was successfully deleted.',
  },
  deleteFailure: {
    id: 'course.group.show.groupUserManager.delete.fail',
    defaultMessage: 'Failed to delete {groupName}.',
  },
  edit: {
    id: 'course.group.show.groupUserManager.edit',
    defaultMessage: 'Edit Details',
  },
  delete: {
    id: 'course.group.show.groupUserManager.delete',
    defaultMessage: 'Delete Group',
  },
  subtitle: {
    id: 'course.group.show.groupUserManager.subtitle',
    defaultMessage:
      '{numMembers} {numMembers, plural, one {member} other {members}}',
  },
  noDescription: {
    id: 'course.group.show.groupUserManager.noDescription',
    defaultMessage: 'No description available.',
  },
  dialogTitle: {
    id: 'course.group.show.groupUserManager.dialogTitle',
    defaultMessage: 'Edit Group',
  },
  searchPlaceholder: {
    id: 'course.group.show.groupUserManager.searchPlaceholder',
    defaultMessage: 'Search by Name (separate by comma to search multiple)',
  },
  hideStudents: {
    id: 'course.group.show.groupUserManager.hideStudents',
    defaultMessage:
      'Hide students who are already in a group under this category',
  },
});

const styles = {
  groupDescription: {
    marginBottom: '2rem',
  },
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
    (data, setError) =>
      dispatch(
        updateGroup(
          categoryId,
          group.id,
          data,
          intl.formatMessage(translations.updateSuccess, {
            groupName: group.name,
          }),
          intl.formatMessage(translations.updateFailure, {
            groupName: group.name,
          }),
          setError,
        ),
      ),
    [dispatch, categoryId, group.name, group.id],
  );

  const handleEdit = useCallback(
    () => dispatch({ type: actionTypes.UPDATE_GROUP_FORM_SHOW }),
    [dispatch],
  );

  const handleDelete = useCallback(
    () =>
      dispatch(
        deleteGroup(
          categoryId,
          group.id,
          intl.formatMessage(translations.deleteSuccess, {
            groupName: group.name,
          }),
          intl.formatMessage(translations.deleteFailure, {
            groupName: group.name,
          }),
        ),
      ).then(() => {
        setIsConfirmingDelete(false);
      }),
    [dispatch, categoryId, group.id, group.name, setIsConfirmingDelete],
  );

  /**
   * @param input - A user instance or array of users
   */
  const onCheck = useCallback(
    (input) => {
      let users = input;
      if (!Array.isArray(input)) users = [input];

      const newMembers = users.map((user) => ({
        ...user,
        groupRole: user.role === 'student' ? 'normal' : 'manager',
      }));

      const newGroup = {
        ...group,
        members: [...group.members, ...newMembers],
      };

      newGroup.members.sort(sortByName).sort(sortByGroupRole);

      return dispatch({
        type: actionTypes.MODIFY_GROUP,
        group: newGroup,
      });
    },
    [dispatch, group],
  );

  /**
   * @param input - A user instance or array of users
   */
  const onUncheck = useCallback(
    (input) => {
      let users = input;
      if (!Array.isArray(input)) users = [input];

      const memberIdsToRemove = new Set(users.map((user) => user.id));

      const newGroup = {
        ...group,
        members: group.members.filter((m) => !memberIdsToRemove.has(m.id)),
      };

      return dispatch({
        type: actionTypes.MODIFY_GROUP,
        group: newGroup,
      });
    },
    [dispatch, group],
  );

  const onChangeRole = useCallback(
    (value, user) => {
      if (user.groupRole === value) return undefined;
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
      return dispatch({
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
        label: <FormattedMessage {...translations.edit} />,
        onClick: handleEdit,
      },
      {
        label: <FormattedMessage {...translations.delete} />,
        onClick: () => setIsConfirmingDelete(true),
        icon: <Delete htmlColor={red[500]} />,
      },
    ],
    [handleEdit, setIsConfirmingDelete],
  );

  const colours = useMemo(() => {
    const result = {};
    [...availableStudents, ...availableStaff].forEach((u) => {
      if (originalMemberMap.has(u.id)) {
        result[u.id] = { light: red[100] };
      }
    });
    [...selectedStudents, ...selectedStaff].forEach((u) => {
      if (!originalMemberMap.has(u.id)) {
        result[u.id] = { light: green[100], dark: green[300] };
      } else if (originalMemberMap.get(u.id).groupRole !== u.groupRole) {
        result[u.id] = { light: blue[100], dark: blue[300] };
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
  const [isDirty, setIsDirty] = useState(false);

  return (
    <>
      <GroupCard
        subtitle={
          <FormattedMessage
            values={{ numMembers: group.members?.length ?? 0 }}
            {...translations.subtitle}
          />
        }
        title={group.name}
        titleButtons={titleButtons}
      >
        <p style={styles.groupDescription}>
          {group.description ?? (
            <FormattedMessage {...translations.noDescription} />
          )}
        </p>
        <div style={styles.listContainerContainer}>
          <div style={{ ...styles.listContainer, marginRight: '1rem' }}>
            <div style={styles.header}>Users that can be added</div>
            <TextField
              label={<FormattedMessage {...translations.searchPlaceholder} />}
              onChange={(event) => setAvailableSearch(event.target.value)}
              style={styles.textField}
              value={availableSearch}
              variant="standard"
            />
            <GroupUserManagerList
              colourMap={colours}
              onCheck={onCheck}
              staff={availableStaff}
              students={availableStudents}
            />
          </div>
          <div style={styles.middleBar}>
            <CompareArrows />
          </div>
          <div style={{ ...styles.listContainer, marginLeft: '1rem' }}>
            <div style={styles.header}>Users in group</div>
            <TextField
              label={<FormattedMessage {...translations.searchPlaceholder} />}
              onChange={(event) => setSelectedSearch(event.target.value)}
              style={styles.textField}
              value={selectedSearch}
              variant="standard"
            />
            <GroupUserManagerList
              colourMap={colours}
              isChecked
              onChangeDropdown={onChangeRole}
              onCheck={onUncheck}
              showDropdown
              staff={selectedStaff}
              students={selectedStudents}
            />
          </div>
        </div>
        <FormControlLabel
          control={
            <Checkbox
              checked={hideInGroup}
              onChange={(_, checked) => setHideInGroup(checked)}
            />
          }
          label={<FormattedMessage {...translations.hideStudents} />}
          style={styles.checkbox}
        />
      </GroupCard>

      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.dialogTitle)}
        expectedDialogTypes={[dialogTypes.UPDATE_GROUP]}
        skipConfirmation={!isDirty}
      >
        <NameDescriptionForm
          emitsVia={(nameDescriptionForm) =>
            setIsDirty(nameDescriptionForm.isDirty)
          }
          initialValues={{
            name: group.name,
            description: group.description,
          }}
          onSubmit={onFormSubmit}
        />
      </GroupFormDialog>
      <ConfirmationDialog
        confirmDelete={isConfirmingDelete}
        confirmDiscard={!isConfirmingDelete}
        onCancel={() => {
          setIsConfirmingDelete(false);
        }}
        onConfirm={() => {
          handleDelete();
        }}
        open={isConfirmingDelete}
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
  intl: PropTypes.object,
};

export default connect((state) => ({
  courseUsers: state.groupsManage.courseUsers,
  originalGroup: state.groupsFetch.groups.find(
    (g) => g.id === state.groupsManage.selectedGroupId,
  ),
}))(injectIntl(GroupUserManager));
