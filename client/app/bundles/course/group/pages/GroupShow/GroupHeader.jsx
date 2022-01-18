import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  IconButton,
  RaisedButton,
} from 'material-ui';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { red500 } from 'material-ui/styles/colors';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import translations from './translations.intl';
import actionTypes, { dialogTypes } from '../../constants';
import { groupShape } from '../../propTypes';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';
import { deleteGroup, updateGroup } from '../../actions';

const styles = {
  card: {
    marginTop: '1rem',
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
  buttonMarginRight: {
    marginRight: 16,
  },
};

const GroupHeader = ({ categoryId, group, intl, dispatch }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
    [dispatch, group.id],
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

  return (
    <>
      <Card style={styles.card}>
        <CardHeader
          title={<h3 style={styles.title}>{group.name}</h3>}
          subtitle={
            <FormattedMessage
              values={{ numMembers: group.members?.length ?? 0 }}
              {...translations.groupHeaderSubtitle}
            />
          }
        />
        <CardText style={styles.text}>
          {group.description ?? (
            <FormattedMessage {...translations.noDescription} />
          )}
        </CardText>
        <CardActions style={styles.actions}>
          <div>
            <RaisedButton
              primary
              label={<FormattedMessage {...translations.editGroup} />}
              onClick={handleEdit}
              style={styles.buttonMarginRight}
            />
          </div>
          <IconButton
            tooltip="Delete Group"
            onClick={() => setIsConfirmingDelete(true)}
          >
            <DeleteIcon color={red500} />
          </IconButton>
        </CardActions>
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

GroupHeader.propTypes = {
  categoryId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  group: groupShape.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: intlShape,
};

export default connect()(injectIntl(GroupHeader));
