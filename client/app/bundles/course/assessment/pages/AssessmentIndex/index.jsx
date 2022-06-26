import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
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
import AssessmentForm from '../../containers/AssessmentForm';
import * as actions from '../../actions';
import translations from './translations.intl';
import actionTypes from '../../constants';

class PopupDialog extends Component {
  onFormSubmit = (data, setError) => {
    const { categoryId, dispatch, intl, tabId } = this.props;

    return dispatch(
      actions.createAssessment(
        categoryId,
        tabId,
        { assessment: data },
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure),
        setError,
      ),
    );
  };

  handleClose = () => {
    this.props.dispatch({
      type: actionTypes.ASSESSMENT_FORM_CANCEL,
    });
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ASSESSMENT_FORM_SHOW });
  };

  render() {
    const {
      confirmationDialogOpen,
      disabled,
      dispatch,
      gamified,
      intl,
      notification,
      visible,
      randomizationAllowed,
    } = this.props;

    const formActions = [
      <Button
        color="primary"
        disabled={disabled}
        key="assessment-popup-dialog-cancel-button"
        onClick={this.handleClose}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>,
      <Button
        color="primary"
        className="btn-submit"
        disabled={disabled}
        form="assessment-form"
        key="assessment-popup-dialog-submit-button"
        type="submit"
      >
        <FormattedMessage {...formTranslations.submit} />
      </Button>,
    ];

    const initialValues = {
      title: '',
      description: '',
      start_at: null,
      end_at: null,
      bonus_end_at: null,
      base_exp: 0,
      time_bonus_exp: 0,
      published: false,
      autograded: false,
      block_student_viewing_after_submitted: false,
      skippable: false,
      allow_partial_submission: false,
      show_mcq_answer: true,
      tabbed_view: false,
      delayed_grade_publication: false,
      password_protected: false,
      view_password: null,
      session_password: null,
      show_mcq_mrq_solution: true,
      use_public: false,
      use_private: true,
      use_evaluation: true,
      show_private: false,
      show_evaluation: false,
      randomization: false,
      has_personal_times: false,
      affects_personal_times: false,
    };

    return (
      <>
        <Button
          variant="contained"
          color="primary"
          disabled={disabled}
          onClick={this.handleOpen}
        >
          {intl.formatMessage(translations.new)}
        </Button>
        <Dialog
          onClose={this.handleClose}
          open={visible}
          maxWidth="md"
          style={{
            top: 40,
          }}
        >
          <DialogTitle>
            {intl.formatMessage(translations.newAssessment)}
          </DialogTitle>
          <DialogContent>
            <AssessmentForm
              disabled={disabled}
              gamified={gamified}
              initialValues={initialValues}
              modeSwitching
              onSubmit={this.onFormSubmit}
              randomizationAllowed={randomizationAllowed}
            />
          </DialogContent>
          <DialogActions>{formActions}</DialogActions>
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          open={confirmationDialogOpen}
          onCancel={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD })
          }
        />
        <NotificationBar notification={notification} />
      </>
    );
  }
}

PopupDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object,
  // If the gamification feature is enabled in the course.
  gamified: PropTypes.bool,
  // If randomization is allowed for assessments in the current course
  randomizationAllowed: PropTypes.bool,
  categoryId: PropTypes.number.isRequired,
  tabId: PropTypes.number.isRequired,
  pristine: PropTypes.bool,
  disabled: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
  confirmationDialogOpen: PropTypes.bool.isRequired,
  notification: notificationShape,
};

export default connect((state) => ({
  ...state.formDialog,
}))(injectIntl(PopupDialog));
