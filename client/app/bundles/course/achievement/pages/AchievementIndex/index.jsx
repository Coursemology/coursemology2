import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit, isPristine } from 'redux-form';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import formTranslations from 'lib/translations/form';
import modalFormStyles from 'lib/styles/ModalForm.scss';
import AchievementForm from '../../containers/AchievementForm';
import * as actions from '../../actions';
import translations from './translations.intl';
import actionTypes, { formNames } from '../../constants';

const styles = {
  newButton: {
    fontSize: 14,
  },
  dialog: {
    width: '80%',
    maxWidth: 'none',
  },
};

class PopupDialog extends React.Component {
  onFormSubmit = (data) => {
    const { intl } = this.props;

    return this.props.dispatch(
      actions.createAchievement(
        { achievement: data },
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure),
      ),
    );
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ACHIEVEMENT_FORM_SHOW });
  };

  handleClose = () => {
    this.props.dispatch({
      type: actionTypes.ACHIEVEMENT_FORM_CANCEL,
      payload: { pristine: this.props.pristine },
    });
  };

  render() {
    const { intl, dispatch, badge } = this.props;

    const formActions = [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        disabled={this.props.disabled}
        onClick={this.handleClose}
        key="achievement-popup-dialog-cancel-button"
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        className="btn-submit"
        primary
        onClick={() => dispatch(submit(formNames.ACHIEVEMENT))}
        disabled={this.props.disabled}
        key="achievement-popup-dialog-submit-button"
      />,
    ];

    const initialValues = {
      published: false,
      badge,
    };

    return (
      <>
        <RaisedButton
          label={intl.formatMessage(translations.new)}
          primary
          onClick={this.handleOpen}
          style={styles.newButton}
        />
        <Dialog
          title={intl.formatMessage(translations.newAchievement)}
          modal={false}
          open={this.props.visible}
          actions={formActions}
          onRequestClose={this.handleClose}
          autoScrollBodyContent
          contentStyle={styles.dialog}
          bodyClassName={modalFormStyles.modalForm}
        >
          <AchievementForm
            onSubmit={this.onFormSubmit}
            initialValues={initialValues}
          />
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          open={this.props.confirmationDialogOpen}
          onCancel={() =>
            dispatch({ type: actionTypes.ACHIEVEMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ACHIEVEMENT_FORM_CONFIRM_DISCARD })
          }
        />
        <NotificationBar notification={this.props.notification} />
      </>
    );
  }
}

PopupDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: intlShape,
  disabled: PropTypes.bool,
  pristine: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
  confirmationDialogOpen: PropTypes.bool.isRequired,
  notification: notificationShape,
  badge: PropTypes.shape({
    url: PropTypes.string,
  }),
};

export default connect((state) => ({
  ...state.indexFormDialog,
  pristine: isPristine(formNames.ACHIEVEMENT)(state),
}))(injectIntl(PopupDialog));
