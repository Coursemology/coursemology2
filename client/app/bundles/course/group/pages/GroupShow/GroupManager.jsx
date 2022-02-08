import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { RaisedButton } from 'material-ui';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import translations from './translations.intl';
import GroupUserTable from './GroupUserTable';
import SummaryTable from './SummaryTable';
import { categoryShape, groupShape } from '../../propTypes';
import actionTypes, { dialogTypes } from '../../constants';
import GroupFormDialog from '../../forms/GroupFormDialog';
import GroupCreationForm from '../../forms/GroupCreationForm';
import { createGroups, updateGroupMembers } from '../../actions';
import { combineGroups, getFinalModifiedGroups } from '../../utils/groups';
import GroupCard from '../../components/GroupCard';

const styles = {
  groupButton: {
    marginBottom: '1rem',
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
      return intl.formatMessage(translations.createSingleGroupFailure, {
        groupName: failed[0].name,
      });
    }
    return intl.formatMessage(translations.createMultipleGroupsFailure, {
      numFailed: failed.length,
    });
  }
  if (created.length === 1 && failed.length === 0) {
    return intl.formatMessage(translations.createSingleGroupSuccess, {
      groupName: created[0].name,
    });
  }

  return (
    intl.formatMessage(translations.createMultipleGroupsSuccess, {
      numCreated: created.length,
    }) +
    (failed.length > 0
      ? ` ${intl.formatMessage(
          translations.createMultipleGroupsPartialFailure,
          {
            numFailed: failed.length,
          },
        )}`
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
    (data) => {
      const existingNames = new Set(groups.map((g) => g.name));
      const groupData = getGroupData(data, existingNames);
      dispatch(
        createGroups(
          category.id,
          { groups: groupData },
          getCreateGroupMessage(intl),
        ),
      );
    },
    [dispatch, category.id, groups],
  );

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: actionTypes.CREATE_GROUP_FORM_SHOW });
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch({ type: actionTypes.MANAGE_GROUPS_END });
  }, [dispatch]);

  const handleGroupSelect = useCallback(
    (groupId) => {
      dispatch({
        type: actionTypes.SET_SELECTED_GROUP_ID,
        selectedGroupId: groupId,
      });
    },
    [dispatch],
  );

  const handleSave = useCallback(() => {
    const finalGroups = getFinalModifiedGroups(groups, modifiedGroups).map(
      (g) => ({
        ...g,
        members: g.members.map((m) => ({ ...m, role: m.groupRole })),
      }),
    );
    dispatch(
      updateGroupMembers(
        category.id,
        { groups: finalGroups },
        'Successfully updated groups!',
        'Something went wrong, please try again later!',
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
        label: 'Create Group(s)',
        onClick: handleOpenCreate,
        isDisabled: isUpdating,
      },
    ],
    [handleOpenCreate, isUpdating],
  );

  return (
    <>
      <GroupCard
        title={`Managing Groups for ${category.name}`}
        subtitle={
          <FormattedMessage
            values={{ numGroups: groups.length }}
            {...translations.categoryHeaderSubtitle}
          />
        }
        titleButtons={titleButtons}
      >
        <p>
          {groups.length === 0
            ? 'You have no groups created. Create one now to get started!'
            : 'Select one of the groups below to manage its members.'}
        </p>
        <div>
          {groups.map((group) => (
            <RaisedButton
              key={group.id}
              label={group.name}
              style={styles.groupButton}
              onClick={() => handleGroupSelect(group.id)}
              secondary={group.id === selectedGroupId}
            />
          ))}
        </div>
      </GroupCard>
      {selectedGroup ? (
        <GroupUserTable
          categoryId={category.id}
          group={selectedGroup}
          groups={combinedGroups}
        />
      ) : null}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '2rem',
          marginBottom: '2rem',
        }}
      >
        <RaisedButton
          label="Cancel"
          style={{ marginRight: '1rem' }}
          onClick={() => {
            if (modifiedGroups.length > 0) {
              setIsConfirmingCancel(true);
              return;
            }
            handleCancel();
          }}
          disabled={isUpdating}
        />
        <RaisedButton
          primary
          label="Save Changes"
          disabled={
            selectedGroup == null || modifiedGroups.length === 0 || isUpdating
          }
          onClick={() => setIsConfirmingSave(true)}
        />
      </div>

      <SummaryTable />

      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.newGroup)}
        expectedDialogTypes={[dialogTypes.CREATE_GROUP]}
      >
        <GroupCreationForm
          onSubmit={onCreateFormSubmit}
          initialValues={{ is_single: true }}
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
  intl: intlShape,
};

export default connect((state) => ({
  selectedGroupId: state.groupsManage.selectedGroupId,
  modifiedGroups: state.groupsManage.modifiedGroups,
  isUpdating: state.groupsManage.isUpdating,
}))(injectIntl(GroupManager));
