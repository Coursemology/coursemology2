import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit, isPristine } from 'redux-form';
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
import actionTypes, { formNames } from '../../constants';

class PopupDialog extends Component {
  onFormSubmit = (data) => {
    const { categoryId, tabId, intl } = this.props;

    return this.props.dispatch(
      actions.createAssessment(
        categoryId,
        tabId,
        { assessment: data },
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure),
      ),
    );
  };

  handleClose = () => {
    this.props.dispatch({
      type: actionTypes.ASSESSMENT_FORM_CANCEL,
      payload: { pristine: this.props.pristine },
    });
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ASSESSMENT_FORM_SHOW });
  };

  render() {
    const { intl, dispatch } = this.props;

    const formActions = [
      <Button
        color="primary"
        disabled={this.props.disabled}
        key="assessment-popup-dialog-cancel-button"
        onClick={this.handleClose}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>,
      <Button
        color="primary"
        className="btn-submit"
        disabled={this.props.disabled}
        key="assessment-popup-dialog-submit-button"
        onClick={() => dispatch(submit(formNames.ASSESSMENT))}
      >
        <FormattedMessage {...formTranslations.submit} />
      </Button>,
    ];

    const initialValues = {
      base_exp: 0,
      time_bonus_exp: 0,
      skippable: false,
      allow_partial_submission: false,
      autograded: false,
      show_mcq_answer: true,
      delayed_grade_publication: false,
      tabbed_view: false,
      show_mcq_mrq_solution: true,
      use_public: false,
      use_private: true,
      use_evaluation: true,
      randomization: false,
      block_student_viewing_after_submitted: false,
    };

    return (
      <>
        <Button
          variant="contained"
          color="primary"
          disabled={this.props.disabled}
          onClick={this.handleOpen}
        >
          {intl.formatMessage(translations.new)}
        </Button>
        <Dialog
          onClose={this.handleClose}
          open={this.props.visible}
          maxWidth="md"
        >
          <DialogTitle>
            {intl.formatMessage(translations.newAssessment)}
          </DialogTitle>
          <DialogContent>
            <AssessmentForm
              gamified={this.props.gamified}
              randomizationAllowed={this.props.randomizationAllowed}
              modeSwitching
              onSubmit={this.onFormSubmit}
              initialValues={initialValues}
            />
          </DialogContent>
          <DialogActions>{formActions}</DialogActions>
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          open={this.props.confirmationDialogOpen}
          onCancel={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD })
          }
        />
        <NotificationBar notification={this.props.notification} />
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
  pristine: isPristine(formNames.ASSESSMENT)(state),
}))(injectIntl(PopupDialog));
