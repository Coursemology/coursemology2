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
import AssessmentForm from '../../containers/AssessmentForm';
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
    const { categoryId, tabId, intl } = this.props;

    return this.props.dispatch(
      actions.createAssessment(
        categoryId,
        tabId,
        { assessment: data },
        intl.formatMessage(translations.creationSuccess),
        intl.formatMessage(translations.creationFailure)
      )
    );
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ASSESSMENT_FORM_SHOW });
  };

  handleClose = () => {
    this.props.dispatch({
      type: actionTypes.ASSESSMENT_FORM_CANCEL,
      payload: { pristine: this.props.pristine },
    });
  };

  render() {
    const { intl, dispatch } = this.props;

    const formActions = [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        disabled={this.props.disabled}
        onClick={this.handleClose}
        key="assessment-popup-dialog-cancel-button"
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        className="btn-submit"
        primary
        onClick={() => dispatch(submit(formNames.ASSESSMENT))}
        disabled={this.props.disabled}
        key="assessment-popup-dialog-submit-button"
      />,
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
        <RaisedButton
          label={intl.formatMessage(translations.new)}
          primary
          onClick={this.handleOpen}
          style={styles.newButton}
        />
        <Dialog
          title={intl.formatMessage(translations.newAssessment)}
          modal={false}
          open={this.props.visible}
          actions={formActions}
          onRequestClose={this.handleClose}
          autoScrollBodyContent
          contentStyle={styles.dialog}
          bodyClassName={modalFormStyles.modalForm}
        >
          <AssessmentForm
            gamified={this.props.gamified}
            randomizationAllowed={this.props.randomizationAllowed}
            modeSwitching
            onSubmit={this.onFormSubmit}
            initialValues={initialValues}
          />
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
  intl: intlShape,
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
