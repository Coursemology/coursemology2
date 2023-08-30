import { useCallback, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import WidthAdjustedNewButton from '../../../../common/components/WidthAdjustedNewButton';
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
      <WidthAdjustedNewButton
        disabled={isManagingGroups}
        minWidth={720}
        nonTextButtonClassName="new-group-category-button bg-white"
        nonTextButtonKey="new-group-category-button"
        onClick={handleOpen}
        text={intl.formatMessage(translations.new)}
        textButtonClassName="new-group-category-button bg-white"
        textButtonKey="new-group-category-button"
      />
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
