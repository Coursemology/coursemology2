import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';

import actionTypes, { dialogTypes } from '../../constants';
import { createCategory } from '../../actions';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';

const translations = defineMessages({
  failure: {
    id: 'course.group.new.createCategory.fail',
    defaultMessage: 'Failed to create group category.',
  },
  new: {
    id: 'course.group.new.new',
    defaultMessage: 'New Category',
  },
  success: {
    id: 'course.group.new.createCategory.success',
    defaultMessage: 'Group category was created.',
  },
});

const styles = {
  newButton: {
    fontSize: 14,
  },
};

// Assumption: If the new button shows, it means that the user is able to create categories.
const PopupDialog = ({ dispatch, intl, isManagingGroups }) => {
  const onFormSubmit = useCallback(
    (data) =>
      dispatch(
        createCategory(
          data,
          intl.formatMessage(translations.success),
          intl.formatMessage(translations.failure),
        ),
      ),
    [dispatch],
  );

  const handleOpen = useCallback(() => {
    dispatch({ type: actionTypes.CREATE_CATEGORY_FORM_SHOW });
  }, [dispatch]);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        disabled={isManagingGroups}
        onClick={handleOpen}
        style={styles.newButton}
      >
        <FormattedMessage {...translations.new} />
      </Button>
      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.new)}
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
  intl: PropTypes.object,
};

export default connect((state) => ({
  isManagingGroups: state.groupsManage.isManagingGroups,
}))(injectIntl(PopupDialog));
