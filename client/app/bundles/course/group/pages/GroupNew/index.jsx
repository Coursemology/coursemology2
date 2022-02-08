import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RaisedButton } from 'material-ui';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import actionTypes, { dialogTypes } from '../../constants';
import translations from './translations.intl';
import { createCategory } from '../../actions';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';

const styles = {
  newButton: {
    fontSize: 14,
  },
};

const PopupDialog = ({ dispatch, intl, isManagingGroups }) => {
  const onFormSubmit = useCallback(
    (data) =>
      dispatch(
        createCategory(
          data,
          intl.formatMessage(translations.createCategorySuccess),
          intl.formatMessage(translations.createCategoryFailure),
        ),
      ),
    [dispatch],
  );

  const handleOpen = useCallback(() => {
    dispatch({ type: actionTypes.CREATE_CATEGORY_FORM_SHOW });
  }, [dispatch]);

  return (
    <>
      <RaisedButton
        label={<FormattedMessage {...translations.newGroupCategory} />}
        primary
        onClick={handleOpen}
        style={styles.newButton}
        disabled={isManagingGroups}
      />
      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.newGroupCategory)}
        expectedDialogTypes={[dialogTypes.CREATE_CATEGORY]}
      >
        <NameDescriptionForm onSubmit={onFormSubmit} />
      </GroupFormDialog>
    </>
  );
};

PopupDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isManagingGroups: PropTypes.bool.isRequired,
  intl: intlShape,
};

export default connect((state) => ({
  isManagingGroups: state.groupsManage.isManagingGroups,
}))(injectIntl(PopupDialog));
