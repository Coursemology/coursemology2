import { useCallback, useState } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';

import { createCategory } from '../../actions';
import actionTypes, { dialogTypes } from '../../constants';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';
import AddButton from 'lib/components/core/buttons/AddButton';

const translations = defineMessages({
  new: {
    id: 'course.group.GroupNew.new',
    defaultMessage: 'New Category',
  },
  success: {
    id: 'course.group.GroupNew.createCategory.success',
    defaultMessage: 'Group category was created.',
  },
  failure: {
    id: 'course.group.GroupNew.createCategory.fail',
    defaultMessage: 'Failed to create group category.',
  },
});

const styles = {
  newButton: {
    fontSize: 14,
  },
};

// Assumption: If the new button shows, it means that the user is able to create categories.
const PopupDialog = ({ dispatch, intl, isManagingGroups }) => {
  const [isDirty, setIsDirty] = useState(false);
  const onFormSubmit = useCallback(
    (data, setError) =>
      dispatch(
        createCategory(
          data,
          intl.formatMessage(translations.success),
          intl.formatMessage(translations.failure),
          setError,
        ),
      ),
    [dispatch],
  );

  const handleOpen = useCallback(() => {
    dispatch({ type: actionTypes.CREATE_CATEGORY_FORM_SHOW });
  }, [dispatch]);

  const minWidthForAddButtonWithText = useMediaQuery('(min-width:720px)');

  return (
    <>
      {minWidthForAddButtonWithText ? (
        <Button
          key="new-group-category-button"
          className="new-group-category-button bg-white"
          color="primary"
          disabled={isManagingGroups}
          onClick={handleOpen}
          style={styles.newButton}
          variant="outlined"
        >
          <FormattedMessage {...translations.new} />
        </Button>
      ) : (
        <AddButton
          key="new-group-category-button"
          className="new-group-category-button bg-white"
          disabled={isManagingGroups}
          onClick={handleOpen}
          tooltip={intl.formatMessage(translations.new)}
        />
      )}
      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.new)}
        expectedDialogTypes={[dialogTypes.CREATE_CATEGORY]}
        skipConfirmation={!isDirty}
      >
        <NameDescriptionForm
          emitsVia={(nameDescriptionForm) =>
            setIsDirty(nameDescriptionForm.isDirty)
          }
          initialValues={{
            name: '',
            description: '',
          }}
          onSubmit={onFormSubmit}
        />
      </GroupFormDialog>
    </>
  );
};

PopupDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isManagingGroups: PropTypes.bool.isRequired,
  intl: PropTypes.object,
};

export default connect(({ groups }) => ({
  isManagingGroups: groups.groupsManage.isManagingGroups,
}))(injectIntl(PopupDialog));
