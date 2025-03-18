import { useCallback, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import AddButton from 'lib/components/core/buttons/AddButton';

import { createCategory } from '../../actions';
import actionTypes, { dialogTypes } from '../../constants';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';

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

  return (
    <>
      <AddButton disabled={isManagingGroups} onClick={handleOpen}>
        {intl.formatMessage(translations.new)}
      </AddButton>
      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.new)}
        expectedDialogTypes={[dialogTypes.CREATE_CATEGORY]}
        skipConfirmation={!isDirty}
      >
        <NameDescriptionForm
          initialValues={{
            name: '',
            description: '',
          }}
          onDirtyChange={setIsDirty}
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
