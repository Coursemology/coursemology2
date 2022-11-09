import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';
import formTranslations from 'lib/translations/form';

import * as actions from '../../actions';
import AssessmentForm from '../../components/AssessmentForm';
import actionTypes from '../../constants';

import translations from './translations.intl';

class PopupDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assessmentForm: undefined,
    };
  }

  onFormSubmit = (data, setError) => {
    const { categoryId, dispatch, intl, tabId } = this.props;

    const attributes = {
      ...data,
      time_bonus_exp: data.time_bonus_exp ? data.time_bonus_exp : 0,
    };

    return dispatch(
      actions.createAssessment(
        categoryId,
        tabId,
        { assessment: attributes },
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure),
        setError,
      ),
    );
  };

  handleClose = () => {
    if (this.state.assessmentForm?.isDirty) {
      this.props.dispatch({
        type: actionTypes.ASSESSMENT_FORM_CANCEL,
      });
    } else {
      this.props.dispatch({
        type: actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD,
      });
    }
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
        key="assessment-popup-dialog-cancel-button"
        color={this.state.assessmentForm?.isDirty ? 'error' : 'primary'}
        disabled={disabled}
        onClick={this.handleClose}
      >
        {this.state.assessmentForm?.isDirty ? (
          <FormattedMessage {...formTranslations.discard} />
        ) : (
          <FormattedMessage {...formTranslations.cancel} />
        )}
      </Button>,
      <Button
        key="assessment-popup-dialog-submit-button"
        className="btn-submit"
        color="primary"
        disabled={disabled}
        form="assessment-form"
        type="submit"
      >
        <FormattedMessage {...translations.createAsDraft} />
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
          color="primary"
          disabled={disabled}
          onClick={this.handleOpen}
          variant="contained"
        >
          {intl.formatMessage(translations.newAssessment)}
        </Button>
        <Dialog
          disableEnforceFocus={true}
          maxWidth="lg"
          onClose={this.handleClose}
          open={visible}
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
              emitsVia={(assessmentForm) => this.setState({ assessmentForm })}
              gamified={gamified}
              initialValues={initialValues}
              modeSwitching={true}
              onSubmit={this.onFormSubmit}
              randomizationAllowed={randomizationAllowed}
            />
          </DialogContent>
          <DialogActions>{formActions}</DialogActions>
        </Dialog>
        <ConfirmationDialog
          confirmDiscard={true}
          onCancel={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD })
          }
          open={confirmationDialogOpen}
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
