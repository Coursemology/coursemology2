/* eslint-disable react/no-array-index-key */
import Immutable from 'immutable';

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import { Tabs, Tab } from 'material-ui/Tabs';

import BuildLog from '../../components/BuildLog';
import OnlineEditor, { validation as editorValidation } from '../../components/OnlineEditor';
import UploadedPackageView from '../../components/UploadedPackageView';
import styles from './ProgrammingQuestionForm.scss';
import translations from './ProgrammingQuestionForm.intl';

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.shape({
    submitForm: PropTypes.func.isRequired,
    updateProgrammingQuestion: PropTypes.func.isRequired,
    updateSkills: PropTypes.func.isRequired,
    updateEditorMode: PropTypes.func.isRequired,
    setValidationErrors: PropTypes.func.isRequired,
    clearHasError: PropTypes.func.isRequired,
    clearSubmissionMessage: PropTypes.func.isRequired,
  }),
  onlineEditorActions: PropTypes.instanceOf(Object).isRequired,
  intl: intlShape.isRequired,
};

const DEFAULT_TIME_LIMIT = 10;
const HARD_TIME_LIMIT = 30;

function validation(data, pathOfKeysToData, intl) {
  const errors = [];
  const questionErrors = {};
  let hasError = false;

  // Check maximum grade
  const maximumGrade = data.get('maximum_grade');
  if (!maximumGrade) {
    questionErrors.maximum_grade = intl.formatMessage(translations.cannotBeBlankValidationError);
    hasError = true;
  } else if (maximumGrade < 0) {
    questionErrors.maximum_grade = intl.formatMessage(translations.positiveNumberValidationError);
    hasError = true;
  }

  // Check language
  if (!data.get('language_id')) {
    questionErrors.language_id = intl.formatMessage(translations.cannotBeBlankValidationError);
    hasError = true;
  }

  // Check time limit
  const timeLimit = data.get('time_limit');
  if (timeLimit && (timeLimit > HARD_TIME_LIMIT || timeLimit <= 0)) {
    questionErrors.time_limit = intl.formatMessage(translations.timeLimitRangeValidationError);
    hasError = true;
  }

  ['memory_limit', 'attempt_limit'].forEach((numberField) => {
    const value = data.get(numberField);

    if (value && value <= 0) {
      questionErrors[numberField] = intl.formatMessage(translations.lessThanEqualZeroValidationError);
      hasError = true;
    }
  });

  // Check file uploaded when no previous package exists
  if (!data.get('edit_online')) {
    if (data.get('package') === null && data.get('package_filename') === null) {
      questionErrors.package_filename = intl.formatMessage(translations.noPackageValidationError);
      hasError = true;
    }
  }

  if (hasError) {
    errors.push({
      path: pathOfKeysToData.concat(['error']),
      error: questionErrors,
    });
  }

  return errors;
}

class ProgrammingQuestionForm extends React.Component {
  onSubmit = (e) => {
    e.preventDefault();
    if (!this.validationCheck()) return;

    const url = this.props.data.getIn(['form_data', 'path']);
    const method = this.props.data.getIn(['form_data', 'method']);

    // Fix for FormData bug on Safari 11.1, Coursemology/coursemology2#2962
    // Disable empty file inputs so that the constructed FormData does not contain any empty files
    const fileInputs = this.form.querySelectorAll('input[type="file"]:not([disabled])');
    fileInputs.forEach((input) => {
      if (input.files.length === 0) {
        input.setAttribute('disabled', '');
      }
    });

    const formData = new FormData(this.form);

    // Re-enable the disabled file inputs
    fileInputs.forEach((input) => {
      input.removeAttribute('disabled');
    });

    const failureMessage = this.props.intl.formatMessage(translations.submitFailureMessage);

    this.props.actions.submitForm(url, method, formData, failureMessage);
  }

  validationCheck() {
    const { data, intl } = this.props;
    const question = data.get('question');
    let errors = validation(question, ['question'], intl);

    // Check online editor
    if (question.get('edit_online')) {
      errors = errors.concat(
        editorValidation(this.props.data, ['test_ui'], intl)
      );
    }

    this.props.actions.setValidationErrors(errors);

    return errors.length === 0;
  }

  submitButtonText() {
    if (this.props.data.get('is_evaluating')) {
      return this.props.intl.formatMessage(translations.evaluatingMessage);
    }

    if (this.props.data.get('is_loading')) {
      return this.props.intl.formatMessage(translations.loadingMessage);
    }

    return this.props.intl.formatMessage(translations.submitButton);
  }

  renderImportAlertView() {
    const alertData = this.props.data.get('import_result').get('alert');

    if (alertData) {
      return <div className={alertData.get('class')}>{alertData.get('message')}</div>;
    }

    return null;
  }

  renderBuildLogView() {
    const data = this.props.data.getIn(['import_result', 'build_log']);

    if (data) {
      return <BuildLog {...{ data }} />;
    }

    return null;
  }

  render() {
    const showEditOnline = question.get('edit_online');

    return (
      <div>
        { this.renderImportAlertView() }
        {
          this.props.data.get('save_errors')
            ? (
              <div className="alert alert-danger">
                {
                this.props.data.get('save_errors').map((errorMessage, index) => <div key={index}>{errorMessage}</div>)
              }
              </div>
            )
            : null
        }

        { this.renderTestView(showEditOnline) }
        { this.renderBuildLogView() }

        <Snackbar
          open={this.props.data.get('has_errors')}
          message={this.props.intl.formatMessage(translations.resolveErrorsMessage)}
          autoHideDuration={5000}
          onRequestClose={() => { this.props.actions.clearHasError(); }}
        />
        <Snackbar
          open={this.props.data.get('show_submission_message')}
          message={this.props.data.get('submission_message')}
          autoHideDuration={2000}
          onRequestClose={() => { this.props.actions.clearSubmissionMessage(); }}
        />
        <RaisedButton
          className={styles.submitButton}
          label={this.submitButtonText()}
          labelPosition="before"
          primary
          id="programmming-question-form-submit"
          type="submit"
          disabled={this.props.data.get('is_loading')}
          icon={this.props.data.get('is_loading') ? <i className="fa fa-spinner fa-lg fa-spin" /> : null}
        />
      </div>
    );
  }
}

ProgrammingQuestionForm.propTypes = propTypes;

export default injectIntl(ProgrammingQuestionForm);
