import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import PropTypes from 'prop-types';

import { createAssessment } from 'course/assessment/operations/assessments';
import AddButton from 'lib/components/core/buttons/AddButton';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import formTranslations from 'lib/translations/form';

import AssessmentForm from '../../components/AssessmentForm';
import actionTypes, { DEFAULT_MONITORING_OPTIONS } from '../../constants';
import translations from '../../translations';

class NewAssessmentFormButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assessmentForm: undefined,
      redirectUrl: undefined,
    };
  }

  onFormSubmit = (data, setError) => {
    const { categoryId, dispatch, intl, tabId } = this.props;

    const timeLimit = data.has_time_limit ? data.time_limit : null;
    const timeBonusExp = data.time_bonus_exp ? data.time_bonus_exp : 0;

    const attributes = {
      ...data,
      time_bonus_exp: timeBonusExp,
      time_limit: timeLimit,
    };

    return dispatch(
      createAssessment(
        categoryId,
        tabId,
        { assessment: attributes },
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure),
        setError,
        (redirectUrl) => this.setState({ redirectUrl }),
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
      isKoditsuExamEnabled,
      visible,
      randomizationAllowed,
      canManageMonitor,
      monitoringEnabled,
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
      has_time_limit: false,
      time_limit: 0,
      base_exp: 0,
      time_bonus_exp: 0,
      published: false,
      has_todo: true,
      autograded: false,
      is_koditsu_enabled: false,
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
      monitoring: canManageMonitor ? DEFAULT_MONITORING_OPTIONS : undefined,
    };

    return (
      <>
        <AddButton onClick={this.handleOpen}>
          {intl.formatMessage(translations.newAssessment)}
        </AddButton>

        <Dialog
          disableEnforceFocus
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
          <DialogContent className="pt-1">
            <AssessmentForm
              canManageMonitor={canManageMonitor}
              disabled={disabled}
              emitsVia={(assessmentForm) => this.setState({ assessmentForm })}
              gamified={gamified}
              initialValues={initialValues}
              isKoditsuExamEnabled={isKoditsuExamEnabled}
              modeSwitching
              monitoringEnabled={monitoringEnabled}
              onSubmit={this.onFormSubmit}
              randomizationAllowed={randomizationAllowed}
            />
          </DialogContent>
          <DialogActions>{formActions}</DialogActions>
        </Dialog>

        <ConfirmationDialog
          confirmDiscard
          onCancel={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD })
          }
          open={confirmationDialogOpen}
        />

        {this.state.redirectUrl && <Navigate to={this.state.redirectUrl} />}
      </>
    );
  }
}

NewAssessmentFormButton.propTypes = {
  categoryId: PropTypes.number.isRequired,
  tabId: PropTypes.number.isRequired,
  gamified: PropTypes.bool,
  isKoditsuExamEnabled: PropTypes.bool,
  randomizationAllowed: PropTypes.bool,
  canManageMonitor: PropTypes.bool,
  monitoringEnabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  confirmationDialogOpen: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  intl: PropTypes.object,
};

export default connect(({ assessments }) => ({
  ...assessments.formDialog,
}))(injectIntl(NewAssessmentFormButton));
