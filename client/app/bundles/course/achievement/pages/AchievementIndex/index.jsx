import { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import { isPristine, submit } from 'redux-form';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import modalFormStyles from 'lib/styles/ModalForm.scss';
import formTranslations from 'lib/translations/form';

import * as actions from '../../actions';
import actionTypes, { formNames } from '../../constants';
import AchievementForm from '../../containers/AchievementForm';

import translations from './translations.intl';

const styles = {
  newButton: {
    fontSize: 14,
  },
  dialog: {
    width: '80%',
    maxWidth: 'none',
  },
};

class PopupDialog extends Component {
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

  handleClose = () => {
    this.props.dispatch({
      type: actionTypes.ACHIEVEMENT_FORM_CANCEL,
      payload: { pristine: this.props.pristine },
    });
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ACHIEVEMENT_FORM_SHOW });
  };

  render() {
    const { intl, dispatch, badge } = this.props;

    const formActions = [
      <FlatButton
        key="achievement-popup-dialog-cancel-button"
        disabled={this.props.disabled}
        label={<FormattedMessage {...formTranslations.cancel} />}
        onClick={this.handleClose}
        primary={true}
      />,
      <FlatButton
        key="achievement-popup-dialog-submit-button"
        className="btn-submit"
        disabled={this.props.disabled}
        label={<FormattedMessage {...formTranslations.submit} />}
        onClick={() => dispatch(submit(formNames.ACHIEVEMENT))}
        primary={true}
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
          onClick={this.handleOpen}
          primary={true}
          style={styles.newButton}
        />
        <Dialog
          actions={formActions}
          autoScrollBodyContent={true}
          bodyClassName={modalFormStyles.modalForm}
          contentStyle={styles.dialog}
          modal={false}
          onRequestClose={this.handleClose}
          open={this.props.visible}
          title={intl.formatMessage(translations.newAchievement)}
        >
          <AchievementForm
            initialValues={initialValues}
            onSubmit={this.onFormSubmit}
          />
        </Dialog>
        <ConfirmationDialog
          confirmDiscard={true}
          onCancel={() =>
            dispatch({ type: actionTypes.ACHIEVEMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ACHIEVEMENT_FORM_CONFIRM_DISCARD })
          }
          open={this.props.confirmationDialogOpen}
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
