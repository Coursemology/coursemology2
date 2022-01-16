import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dialog, FlatButton, RaisedButton } from 'material-ui';
import { submit, isPristine } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import formTranslations from 'lib/translations/form';
import modalFormStyles from 'lib/styles/ModalForm.scss';

import actionTypes, { formNames } from '../../constants';
import translations from './translations.intl';
import CategoryForm from './CategoryFom';

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
  notification,
  isPristine: pristine,
  intl,
}) => {
  const onFormSubmit = useCallback((data) => {
    // TODO: Dispatch data and look into loading/disabled state
    console.log(data);
  }, []);

  const handleOpen = useCallback(() => {
    dispatch({ type: actionTypes.CATEGORY_FORM_SHOW });
  }, []);

  const handleClose = useCallback(() => {
    dispatch({
      type: actionTypes.CATEGORY_FORM_CANCEL,
      payload: { isPristine: pristine },
    });
  }, [pristine]);

  const formActions = useMemo(
    () => [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        onClick={handleClose}
        key="group-category-popup-dialog-cancel-button"
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        className="btn-submit"
        primary
        onClick={() => dispatch(submit(formNames.GROUP_CATEGORY))}
        key="group-category-popup-dialog-submit-button"
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
        open={isShown}
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
        open={isConfirmationDialogOpen}
        onCancel={() =>
          dispatch({ type: actionTypes.CATEGORY_FORM_CONFIRM_CANCEL })
        }
        onConfirm={() =>
          dispatch({ type: actionTypes.CATEGORY_FORM_CONFIRM_DISCARD })
        }
      />
      <NotificationBar notification={notification} />
    </>
  );
};

PopupDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isPristine: PropTypes.bool,
  isShown: PropTypes.bool.isRequired,
  isConfirmationDialogOpen: PropTypes.bool.isRequired,
  notification: notificationShape,
  intl: intlShape,
};

export default connect((state) => ({
  ...state.groupsNew,
  isPristine: isPristine(formNames.GROUP_CATEGORY)(state),
}))(injectIntl(PopupDialog));
