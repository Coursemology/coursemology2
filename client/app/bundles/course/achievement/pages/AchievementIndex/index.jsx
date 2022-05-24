import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import formTranslations from 'lib/translations/form';
import AchievementForm from '../../containers/AchievementForm';
import * as actions from '../../actions';
import translations from './translations.intl';
import actionTypes from '../../constants';

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
  onFormSubmit = (data, setError) => {
    const { dispatch, intl } = this.props;

    return dispatch(
      actions.createAchievement(
        { achievement: data },
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure),
        setError,
      ),
    );
  };

  handleClose = () => {
    this.props.dispatch({
      type: actionTypes.ACHIEVEMENT_FORM_CANCEL,
    });
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ACHIEVEMENT_FORM_SHOW });
  };

  render() {
    const {
      badge,
      confirmationDialogOpen,
      disabled,
      dispatch,
      notification,
      intl,
      visible,
    } = this.props;

    const formActions = [
      <Button
        color="primary"
        disabled={disabled}
        key="achievement-popup-dialog-cancel-button"
        onClick={this.handleClose}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>,
      <Button
        color="primary"
        className="btn-submit"
        disabled={disabled}
        form="achievement-form"
        key="achievement-popup-dialog-submit-button"
        type="submit"
      >
        <FormattedMessage {...formTranslations.submit} />
      </Button>,
    ];

    const initialValues = {
      title: '',
      description: '',
      published: false,
      badge,
    };

    return (
      <>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleOpen}
          style={styles.newButton}
        >
          {intl.formatMessage(translations.new)}
        </Button>
        <Dialog onClose={this.handleClose} open={visible} maxWidth="xl">
          <DialogTitle>
            {intl.formatMessage(translations.newAchievement)}
          </DialogTitle>
          <DialogContent>
            <AchievementForm
              onSubmit={this.onFormSubmit}
              initialValues={initialValues}
            />
          </DialogContent>
          <DialogActions>{formActions}</DialogActions>
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          open={confirmationDialogOpen}
          onCancel={() =>
            dispatch({ type: actionTypes.ACHIEVEMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ACHIEVEMENT_FORM_CONFIRM_DISCARD })
          }
        />
        <NotificationBar notification={notification} />
      </>
    );
  }
}

PopupDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: intlShape,
  disabled: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
  confirmationDialogOpen: PropTypes.bool.isRequired,
  notification: notificationShape,
  badge: PropTypes.shape({
    url: PropTypes.string,
  }),
};

export default connect((state) => ({
  ...state.indexFormDialog,
}))(injectIntl(PopupDialog));
