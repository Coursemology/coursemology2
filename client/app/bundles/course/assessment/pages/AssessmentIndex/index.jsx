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
import AssessmentForm from '../../containers/AssessmentForm';

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
      <FlatButton
        key="assessment-popup-dialog-cancel-button"
        disabled={this.props.disabled}
        label={<FormattedMessage {...formTranslations.cancel} />}
        onClick={this.handleClose}
        primary={true}
      />,
      <FlatButton
        key="assessment-popup-dialog-submit-button"
        className="btn-submit"
        disabled={this.props.disabled}
        label={<FormattedMessage {...formTranslations.submit} />}
        onClick={() => dispatch(submit(formNames.ASSESSMENT))}
        primary={true}
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
          title={intl.formatMessage(translations.newAssessment)}
        >
          <AssessmentForm
            gamified={this.props.gamified}
            initialValues={initialValues}
            modeSwitching={true}
            onSubmit={this.onFormSubmit}
            randomizationAllowed={this.props.randomizationAllowed}
          />
        </Dialog>
        <ConfirmationDialog
          confirmDiscard={true}
          onCancel={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL })
          }
          onConfirm={() =>
            dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD })
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
