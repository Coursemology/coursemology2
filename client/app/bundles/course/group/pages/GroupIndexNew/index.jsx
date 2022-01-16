import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dialog, FlatButton, RaisedButton } from 'material-ui';
import { submit, isPristine } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import formTranslations from 'lib/translations/form';
import modalFormStyles from 'lib/styles/ModalForm.scss';

import actionTypes, { dialogTypes, formNames } from '../../constants';
import translations from './translations.intl';
import CategoryForm from '../components/CategoryForm';
import { createCategory } from '../../actions';

const styles = {
  newButton: {
    fontSize: 14,
  },
  dialog: {
    width: '80%',
    maxWidth: 700,
  },
};

const PopupDialog = ({
  dispatch,
  isShown,
  isConfirmationDialogOpen,
  isPristine: pristine,
  isDisabled,
  dialogType,
  intl,
}) => {
  const onFormSubmit = useCallback(
    (data) =>
      dispatch(
        createCategory(
          data,
          intl.formatMessage(translations.createCategorySuccess),
          intl.formatMessage(translations.createCategoryFailure),
        ),
      ),
    [dispatch, createCategory],
  );

  const handleOpen = useCallback(() => {
    dispatch({ type: actionTypes.CREATE_CATEGORY_FORM_SHOW });
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch({
      type: actionTypes.DIALOG_CANCEL,
      payload: { isPristine: pristine },
    });
  }, [dispatch, pristine]);

  const formActions = useMemo(
    () => [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        onClick={handleClose}
        disabled={isDisabled}
        key="create-group-category-popup-dialog-cancel-button"
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        className="btn-submit"
        primary
        onClick={() => dispatch(submit(formNames.GROUP_CATEGORY))}
        disabled={isDisabled}
        key="create-group-category-popup-dialog-submit-button"
      />,
    ],
    [handleClose],
  );

  return (
    <>
      <RaisedButton
        label={<FormattedMessage {...translations.newGroupCategory} />}
        primary
        onClick={handleOpen}
        style={styles.newButton}
      />
      <Dialog
        title={intl.formatMessage(translations.newGroupCategory)}
        modal={false}
        open={isShown && dialogType === dialogTypes.CREATE_CATEGORY}
        actions={formActions}
        onRequestClose={handleClose}
        autoScrollBodyContent
        contentStyle={styles.dialog}
        bodyClassName={modalFormStyles.modalForm}
      >
        <CategoryForm onSubmit={onFormSubmit} />
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={
          isConfirmationDialogOpen && dialogType === dialogTypes.CREATE_CATEGORY
        }
        onCancel={() => dispatch({ type: actionTypes.DIALOG_CONFIRM_CANCEL })}
        onConfirm={() => dispatch({ type: actionTypes.DIALOG_CONFIRM_DISCARD })}
      />
    </>
  );
};

PopupDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isPristine: PropTypes.bool,
  isShown: PropTypes.bool.isRequired,
  isConfirmationDialogOpen: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  dialogType: PropTypes.string.isRequired,
  intl: intlShape,
};

export default connect((state) => ({
  ...state.groupsDialog,
  isPristine: isPristine(formNames.GROUP_CATEGORY)(state),
}))(injectIntl(PopupDialog));
