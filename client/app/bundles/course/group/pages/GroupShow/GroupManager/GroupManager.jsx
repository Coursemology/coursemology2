import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import GroupUserManager from './GroupUserManager';
import ChangeSummaryTable from './ChangeSummaryTable';
import { categoryShape, groupShape } from '../../../propTypes';
import actionTypes, { dialogTypes } from '../../../constants';
import GroupFormDialog from '../../../forms/GroupFormDialog';
import GroupCreationForm from '../../../forms/GroupCreationForm';
import { createGroups, updateGroupMembers } from '../../../actions';
import { combineGroups, getFinalModifiedGroups } from '../../../utils/groups';
import GroupCard from '../../../components/GroupCard';

const translations = defineMessages({
  createSingleSuccess: {
    id: 'course.group.show.groupManager.createSingle.success',
    defaultMessage: '{groupName} was successfully created.',
  },
  createSingleFailure: {
    id: 'course.group.show.groupManager.createSingle.fail',
    defaultMessage: 'Failed to create {groupName}.',
  },
  createMultipleSuccess: {
    id: 'course.group.show.groupManager.createMultiple.success',
    defaultMessage:
      '{numCreated} {numCreated, plural, one {group was} other {groups were}} successfully created.',
  },
  createMultiplePartialFailure: {
    id: 'course.group.show.groupManager.createMultiple.partialFail',
    defaultMessage:
      'Failed to create {numFailed} {numFailed, plural, one {group} other {groups}}.',
  },
  createMultipleFailure: {
    id: 'course.group.show.groupManager.createMultiple.fail',
    defaultMessage: 'Failed to create {numFailed} groups.',
  },
  updateMembersSuccess: {
    id: 'course.group.show.groupManager.updateMembers.success',
    defaultMessage: 'Groups have been successfully updated.',
  },
  updateMembersFailure: {
    id: 'course.group.show.groupManager.updateMembers.failure',
    defaultMessage: 'Something went wrong, please try again later!',
  },
  subtitle: {
    id: 'course.group.show.groupManager.subtitle',
    defaultMessage:
      '{numGroups} {numGroups, plural, one {group} other {groups}}',
  },
  dialogTitle: {
    id: 'course.group.show.groupManager.dialogTitle',
    defaultMessage: 'New Group(s)',
  },
  create: {
    id: 'course.group.show.groupManager.create',
    defaultMessage: 'Create Group(s)',
  },
  noneCreated: {
    id: 'course.group.show.groupManager.noneCreated',
    defaultMessage:
      'You have no groups created. Create one now to get started!',
  },
  noneSelected: {
    id: 'course.group.show.groupManager.noneSelected',
    defaultMessage: 'Select one of the groups below to manage its members.',
  },
  title: {
    id: 'course.group.show.groupManager.title',
    defaultMessage: 'Managing Groups for {categoryName}',
  },
  cancel: {
    id: 'course.group.show.groupManager.cancel',
    defaultMessage: 'Cancel',
  },
  saveChanges: {
    id: 'course.group.show.groupManager.saveChanges',
    defaultMessage: 'Save Changes',
  },
  confirmDiscard: {
    id: 'course.group.show.groupManager.confirmDiscard',
    defaultMessage: 'Are you sure you wish to discard the changes made?',
  },
  confirmSave: {
    id: 'course.group.show.groupManager.confirmSave',
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
        title={
          <FormattedMessage
            {...translations.title}
            values={{ categoryName: category.name }}
          />
        }
        subtitle={
          <FormattedMessage
            values={{ numGroups: groups.length }}
            {...translations.subtitle}
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
              variant={group.id === selectedGroupId ? 'contained' : 'outlined'}
              color="secondary"
              key={group.id}
              style={styles.groupButton}
              onClick={() => handleGroupSelect(group.id)}
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
          variant="contained"
          color="secondary"
          style={styles.cancelButton}
          onClick={() => {
            if (modifiedGroups.length > 0) {
              setIsConfirmingCancel(true);
              return;
            }
            handleCancel();
          }}
          disabled={isUpdating}
        >
          <FormattedMessage {...translations.cancel} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={
            selectedGroup == null || modifiedGroups.length === 0 || isUpdating
          }
          onClick={() => setIsConfirmingSave(true)}
        >
          <FormattedMessage {...translations.saveChanges} />
        </Button>
      </div>

      <ChangeSummaryTable />

      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.dialogTitle)}
        expectedDialogTypes={[dialogTypes.CREATE_GROUP]}
      >
        <GroupCreationForm
          onSubmit={onCreateFormSubmit}
          initialValues={{
            name: '',
            description: '',
            num_to_create: 0,
            is_single: true,
          }}
          existingGroups={groups}
        />
      </GroupFormDialog>
      <ConfirmationDialog
        confirmDiscard={isConfirmingCancel}
        confirmSubmit={isConfirmingSave}
        open={isConfirmingCancel || isConfirmingSave}
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
        message={
          isConfirmingCancel
            ? intl.formatMessage(translations.confirmDiscard)
            : intl.formatMessage(translations.confirmSave)
        }
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

export default connect((state) => ({
  selectedGroupId: state.groupsManage.selectedGroupId,
  modifiedGroups: state.groupsManage.modifiedGroups,
  isUpdating: state.groupsManage.isUpdating,
}))(injectIntl(GroupManager));
