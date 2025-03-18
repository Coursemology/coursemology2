import { useCallback, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import { createGroups, updateGroupMembers } from '../../../actions';
import GroupCard from '../../../components/GroupCard';
import actionTypes, { dialogTypes } from '../../../constants';
import GroupCreationForm from '../../../forms/GroupCreationForm';
import GroupFormDialog from '../../../forms/GroupFormDialog';
import { categoryShape, groupShape } from '../../../propTypes';
import { combineGroups, getFinalModifiedGroups } from '../../../utils/groups';

import ChangeSummaryTable from './ChangeSummaryTable';
import GroupUserManager from './GroupUserManager';

const translations = defineMessages({
  createSingleSuccess: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.createSingleSuccess',
    defaultMessage: '{groupName} was successfully created.',
  },
  createSingleFailure: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.createSingleFailure',
    defaultMessage: 'Failed to create {groupName}.',
  },
  createMultipleSuccess: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.createMultipleSuccess',
    defaultMessage:
      '{numCreated} {numCreated, plural, one {group was} other {groups were}} successfully created.',
  },
  createMultiplePartialFailure: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.createMultiplePartialFailure',
    defaultMessage:
      'Failed to create {numFailed} {numFailed, plural, one {group} other {groups}}.',
  },
  createMultipleFailure: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.createMultipleFailure',
    defaultMessage: 'Failed to create {numFailed} groups.',
  },
  updateMembersSuccess: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.updateMembersSuccess',
    defaultMessage: 'Groups have been successfully updated.',
  },
  updateMembersFailure: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.updateMembersFailure',
    defaultMessage: 'Something went wrong, please try again later!',
  },
  subtitle: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.subtitle',
    defaultMessage:
      '{numGroups} {numGroups, plural, one {group} other {groups}}',
  },
  dialogTitle: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.dialogTitle',
    defaultMessage: 'New Group(s)',
  },
  create: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.create',
    defaultMessage: 'Create Group(s)',
  },
  noneCreated: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.noneCreated',
    defaultMessage:
      'You have no groups created. Create one now to get started!',
  },
  noneSelected: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.noneSelected',
    defaultMessage: 'Select one of the groups below to manage its members.',
  },
  title: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.title',
    defaultMessage: 'Managing Groups for {categoryName}',
  },
  cancel: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.cancel',
    defaultMessage: 'Cancel',
  },
  saveChanges: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.saveChanges',
    defaultMessage: 'Save Changes',
  },
  confirmDiscard: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.confirmDiscard',
    defaultMessage: 'Are you sure you wish to discard the changes made?',
  },
  confirmSave: {
    id: 'course.group.GroupShow.GroupManager.GroupManager.confirmSave',
    defaultMessage:
      'Are you sure you wish to save all changes made to the groups under this category?',
  },
});

const styles = {
  groupButton: {
    marginBottom: '1rem',
    marginRight: '1rem',
  },
  bottomButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  cancelButton: {
    marginRight: '1rem',
  },
};

const getGroupData = (data, existingNames) => {
  const groupData = [];
  const isSingle = data.is_single === 'true' || data.is_single === true;
  if (isSingle) {
    groupData.push({ name: data.name, description: data.description });
  } else {
    const numToCreate = Number.parseInt(data.num_to_create, 10);
    for (let i = 1; i <= numToCreate; i += 1) {
      const name = `${data.name} ${i}`;
      if (!existingNames.has(name)) {
        groupData.push({ name });
      }
    }
  }
  return groupData;
};

const getCreateGroupMessage = (intl) => (created, failed) => {
  if (created.length === 0) {
    if (failed.length === 1) {
      return intl.formatMessage(translations.createSingleFailure, {
        groupName: failed[0].name,
      });
    }
    return intl.formatMessage(translations.createMultipleFailure, {
      numFailed: failed.length,
    });
  }
  if (created.length === 1 && failed.length === 0) {
    return intl.formatMessage(translations.createSingleSuccess, {
      groupName: created[0].name,
    });
  }

  return (
    intl.formatMessage(translations.createMultipleSuccess, {
      numCreated: created.length,
    }) +
    (failed.length > 0
      ? ` ${intl.formatMessage(translations.createMultiplePartialFailure, {
          numFailed: failed.length,
        })}`
      : '')
  );
};

const GroupManager = ({
  dispatch,
  category,
  groups,
  modifiedGroups,
  selectedGroupId,
  isUpdating,
  intl,
}) => {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const onCreateFormSubmit = useCallback(
    (data, setError) => {
      const existingNames = new Set(groups.map((g) => g.name));
      const groupData = getGroupData(data, existingNames);
      return dispatch(
        createGroups(
          category.id,
          { groups: groupData },
          getCreateGroupMessage(intl),
          setError,
        ),
      );
    },
    [dispatch, category.id, groups],
  );

  const handleOpenCreate = useCallback(
    () => dispatch({ type: actionTypes.CREATE_GROUP_FORM_SHOW }),
    [dispatch],
  );

  const handleCancel = useCallback(
    () => dispatch({ type: actionTypes.MANAGE_GROUPS_END }),
    [dispatch],
  );

  const handleGroupSelect = useCallback(
    (groupId) =>
      dispatch({
        type: actionTypes.SET_SELECTED_GROUP_ID,
        selectedGroupId: groupId,
      }),
    [dispatch],
  );

  const handleSave = useCallback(() => {
    const finalGroups = getFinalModifiedGroups(groups, modifiedGroups).map(
      (g) => ({
        ...g,
        members: g.members.map((m) => ({ ...m, role: m.groupRole })),
      }),
    );
    return dispatch(
      updateGroupMembers(
        category.id,
        { groups: finalGroups },
        intl.formatMessage(translations.updateMembersSuccess),
        intl.formatMessage(translations.updateMembersFailure),
      ),
    );
  }, [dispatch, category.id, groups, modifiedGroups]);

  const combinedGroups = useMemo(
    () => combineGroups(groups, modifiedGroups),
    [groups, modifiedGroups],
  );
  const selectedGroup = useMemo(
    () => combinedGroups.find((group) => group.id === selectedGroupId),
    [combinedGroups, selectedGroupId],
  );

  const titleButtons = useMemo(
    () => [
      {
        label: <FormattedMessage {...translations.create} />,
        onClick: handleOpenCreate,
        isDisabled: isUpdating,
      },
    ],
    [handleOpenCreate, isUpdating],
  );

  return (
    <>
      <GroupCard
        subtitle={
          <FormattedMessage
            values={{ numGroups: groups.length }}
            {...translations.subtitle}
          />
        }
        title={
          <FormattedMessage
            {...translations.title}
            values={{ categoryName: category.name }}
          />
        }
        titleButtons={titleButtons}
      >
        <p>
          {groups.length === 0 ? (
            <FormattedMessage {...translations.noneCreated} />
          ) : (
            <FormattedMessage {...translations.noneSelected} />
          )}
        </p>
        <div>
          {groups.map((group) => (
            <Button
              key={group.id}
              color="secondary"
              onClick={() => handleGroupSelect(group.id)}
              style={styles.groupButton}
              variant={group.id === selectedGroupId ? 'contained' : 'outlined'}
            >
              {`${group.name} (${group.members.length})`}
            </Button>
          ))}
        </div>
      </GroupCard>
      {selectedGroup ? (
        <GroupUserManager
          categoryId={category.id}
          group={selectedGroup}
          groups={combinedGroups}
        />
      ) : null}
      <div style={styles.bottomButtonContainer}>
        <Button
          color="secondary"
          disabled={isUpdating}
          onClick={() => {
            if (modifiedGroups.length > 0) {
              setIsConfirmingCancel(true);
              return;
            }
            handleCancel();
          }}
          style={styles.cancelButton}
          variant="contained"
        >
          <FormattedMessage {...translations.cancel} />
        </Button>
        <Button
          color="primary"
          disabled={
            selectedGroup == null || modifiedGroups.length === 0 || isUpdating
          }
          onClick={() => setIsConfirmingSave(true)}
          variant="contained"
        >
          <FormattedMessage {...translations.saveChanges} />
        </Button>
      </div>

      <ChangeSummaryTable />

      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.dialogTitle)}
        expectedDialogTypes={[dialogTypes.CREATE_GROUP]}
        skipConfirmation={!isDirty}
      >
        <GroupCreationForm
          existingGroups={groups}
          initialValues={{
            name: '',
            description: '',
            num_to_create: 0,
            is_single: true,
          }}
          onDirtyChange={setIsDirty}
          onSubmit={onCreateFormSubmit}
        />
      </GroupFormDialog>
      <ConfirmationDialog
        confirmDiscard={isConfirmingCancel}
        confirmSubmit={isConfirmingSave}
        message={
          isConfirmingCancel
            ? intl.formatMessage(translations.confirmDiscard)
            : intl.formatMessage(translations.confirmSave)
        }
        onCancel={() => {
          if (isConfirmingCancel) {
            setIsConfirmingCancel(false);
          } else {
            setIsConfirmingSave(false);
          }
        }}
        // TODO: Add some loading animation
        onConfirm={() => {
          if (isConfirmingCancel) {
            setIsConfirmingCancel(false);
            handleCancel();
          } else {
            setIsConfirmingSave(false);
            handleSave();
          }
        }}
        open={isConfirmingCancel || isConfirmingSave}
      />
    </>
  );
};

GroupManager.propTypes = {
  dispatch: PropTypes.func.isRequired,
  category: categoryShape.isRequired,
  groups: PropTypes.arrayOf(groupShape).isRequired,
  selectedGroupId: PropTypes.number.isRequired,
  modifiedGroups: PropTypes.arrayOf(groupShape).isRequired,
  isUpdating: PropTypes.bool.isRequired,
  intl: PropTypes.object,
};

export default connect(({ groups }) => ({
  selectedGroupId: groups.groupsManage.selectedGroupId,
  modifiedGroups: groups.groupsManage.modifiedGroups,
  isUpdating: groups.groupsManage.isUpdating,
}))(injectIntl(GroupManager));
