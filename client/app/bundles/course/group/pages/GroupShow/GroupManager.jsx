import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  DropDownMenu,
  MenuItem,
  RaisedButton,
} from 'material-ui';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { categoryShape, groupShape } from '../../propTypes';
import translations from './translations.intl';
import actionTypes, { dialogTypes } from '../../constants';
import GroupFormDialog from '../../forms/GroupFormDialog';
import GroupCreationForm from '../../forms/GroupCreationForm';
import { createGroups, updateGroupMembers } from '../../actions';
import GroupHeader from './GroupHeader';
import CourseUserTable from './CourseUserTable';
import { combineGroups, getFinalModifiedGroups } from '../../utils/groups';

const styles = {
  card: {
    marginBottom: '2rem',
  },
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  text: {
    paddingTop: 0,
  },
  actions: {
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between',
  },
  dropdown: {
    width: '100%',
  },
  dropdownContent: {
    paddingLeft: 0,
    paddingRight: 36,
  },
  dropdownUnderline: {
    marginLeft: 0,
    marginRight: 0,
  },
};

const GroupManager = ({
  dispatch,
  category,
  groups,
  modifiedGroups,
  selectedGroupId,
  intl,
}) => {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);

  const getCreateGroupMessage = (created, failed) => {
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

  const onCreateFormSubmit = useCallback(
    (data) => {
      const existingNames = new Set(groups.map((g) => g.name));
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
      dispatch(
        createGroups(category.id, { groups: groupData }, getCreateGroupMessage),
      );
    },
    [dispatch, groups],
  );

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: actionTypes.CREATE_GROUP_FORM_SHOW });
  }, [dispatch]);

  const handleCancel = () => {
    dispatch({ type: actionTypes.MANAGE_GROUPS_END });
  };

  const handleGroupSelect = (_event, _index, value) => {
    if (value === 0) {
      handleOpenCreate();
      return;
    }
    dispatch({
      type: actionTypes.SET_SELECTED_GROUP_ID,
      selectedGroupId: value,
    });
  };

  const handleSave = () => {
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
  };

  const combinedGroups = combineGroups(groups, modifiedGroups);
  const selectedGroup = combinedGroups.find(
    (group) => group.id === selectedGroupId,
  );

  return (
    <>
      <Card style={styles.card}>
        <CardHeader
          title={
            <h3 style={styles.title}>Managing Groups for {category.name}</h3>
          }
          subtitle={
            <FormattedMessage
              values={{ numGroups: groups.length }}
              {...translations.categoryHeaderSubtitle}
            />
          }
        />
        <CardText style={styles.text}>
          {category.description ?? (
            <FormattedMessage {...translations.noDescription} />
          )}
        </CardText>
        <CardActions style={styles.actions}>
          <RaisedButton
            label="Cancel"
            onClick={() => {
              if (modifiedGroups.length > 0) {
                setIsConfirmingCancel(true);
                return;
              }
              handleCancel();
            }}
          />
        </CardActions>
      </Card>
      <Card style={styles.card}>
        <CardText>
          <DropDownMenu
            value={selectedGroupId}
            onChange={handleGroupSelect}
            style={styles.dropdown}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            labelStyle={styles.dropdownContent}
            underlineStyle={styles.dropdownUnderline}
            autoWidth={false}
          >
            <MenuItem
              disabled
              value={-1}
              primaryText="Select a group to manage"
            />
            <MenuItem value={0} primaryText="Create new group(s)" />
            {groups.map((group) => (
              <MenuItem
                key={group.id}
                value={group.id}
                primaryText={group.name}
              />
            ))}
          </DropDownMenu>
        </CardText>
      </Card>
      {selectedGroup ? (
        <GroupHeader categoryId={category.id} group={selectedGroup} />
      ) : null}
      {selectedGroup ? (
        <CourseUserTable group={selectedGroup} groups={combinedGroups} />
      ) : null}
      {selectedGroup ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '2rem',
            marginBottom: '3rem',
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
          />
          <RaisedButton
            primary
            label="Save Changes"
            disabled={modifiedGroups.length === 0}
            onClick={() => setIsConfirmingSave(true)}
          />
        </div>
      ) : null}

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
  intl: intlShape,
};

export default connect((state) => ({
  selectedGroupId: state.groupsManage.selectedGroupId,
  modifiedGroups: state.groupsManage.modifiedGroups,
}))(injectIntl(GroupManager));
