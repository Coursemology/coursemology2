import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardText,
  DropDownMenu,
  MenuItem,
} from 'material-ui';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

import { categoryShape, groupShape } from '../../propTypes';
import translations from './translations.intl';
import actionTypes, { dialogTypes } from '../../constants';
import GroupFormDialog from '../../forms/GroupFormDialog';
import GroupCreationForm from '../../forms/GroupCreationForm';

const styles = {
  card: {
    marginBottom: '1rem',
  },
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  text: {
    paddingTop: 0,
  },
  dropdown: {
    width: '100%',
  },
  dropdownContent: {
    // paddingLeft: 0,
    paddingRight: 36,
  },
  dropdownUnderline: {
    marginLeft: 0,
    marginRight: 0,
  },
};

const GroupManager = ({ dispatch, category, groups, intl }) => {
  const [selectedGroupId, setSelectedGroupId] = useState(-1);
  const [currentGroups, setCurrentGroups] = useState(groups);
  const [isEditing, setIsEditing] = useState(false);

  const onCreateFormSubmit = useCallback((data) => {
    console.log(data);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setIsEditing(false);
    dispatch({ type: actionTypes.CREATE_GROUP_FORM_SHOW });
  }, [dispatch, setIsEditing]);

  const handleGroupSelect = (_event, _index, value) => {
    if (value === 0) {
      handleOpenCreate();
      return;
    }
    setSelectedGroupId(value);
  };

  // const selectedGroup = currentGroups.find(
  //   (group) => group.id === selectedGroupId,
  // );

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
      </Card>
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
        <MenuItem disabled value={-1} primaryText="Select a group to manage" />
        <MenuItem value={0} primaryText="Create new group(s)" />
        {currentGroups.map((group) => (
          <MenuItem key={group.id} value={group.id} primaryText={group.name} />
        ))}
      </DropDownMenu>
      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.newGroup)}
        expectedDialogTypes={[
          dialogTypes.CREATE_GROUP,
          dialogTypes.UPDATE_GROUP,
        ]}
        // initialValues={
        //   isEditing
        //     ? currentGroups.find((g) => g.id === selectedGroupId)
        //     : undefined
        // }
      >
        {isEditing ? null : <GroupCreationForm onSubmit={onCreateFormSubmit} />}
      </GroupFormDialog>
    </>
  );
};

GroupManager.propTypes = {
  dispatch: PropTypes.func.isRequired,
  category: categoryShape.isRequired,
  groups: PropTypes.arrayOf(groupShape).isRequired,

  intl: intlShape,
};

export default connect()(injectIntl(GroupManager));
