import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm, Form } from 'redux-form';

import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import InputField from '../../components/InputField';
import SummernoteField from '../../components/SummernoteField';
import MultiSelectSkillsField from '../../components/MultiSelectSkillsField';
import FileUploadField from '../../components/FileUploadField';

import styles from './ScribingQuestionForm.scss';
import translations from './ScribingQuestionForm.intl';

import { formNames } from '../../constants';
import { dataShape, questionShape } from '../../propTypes';

const propTypes = {
  actions: React.PropTypes.shape({
    fetchSkills: PropTypes.func.isRequired,
    fetchScribingQuestion: PropTypes.func.isRequired,
    createScribingQuestion: PropTypes.func.isRequired,
    updateScribingQuestion: PropTypes.func.isRequired,
    clearSubmitError: PropTypes.func.isRequired,
  }),
  data: dataShape.isRequired,
  scribingId: PropTypes.string,
  intl: intlShape.isRequired,
  // Redux-form proptypes
  formValues: PropTypes.shape({
    question_scribing: PropTypes.shape(questionShape),
  }),
  invalid: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
};

class ScribingQuestionForm extends React.Component {
  static convertNull(value) {
    return value === null ? '' : value;
  }

  componentDidMount() {
    const { scribingId } = this.props;
    const { fetchScribingQuestion, fetchSkills } = this.props.actions;

    if (scribingId) {
      fetchScribingQuestion();
    } else {
      fetchSkills();
    }
    this.summernoteEditors = $('#scribing-question-form .note-editor .note-editable');
  }

  componentWillReceiveProps(nextProps) {
    this.summernoteEditors.attr('contenteditable', !nextProps.data.isLoading);
  }

  handleCreateQuestion = (data) => {
    const { createScribingQuestion } = this.props.actions;
    return createScribingQuestion(data);
  }

  handleUpdateQuestion = (data) => {
    const { scribingId } = this.props;
    const { updateScribingQuestion } = this.props.actions;

    return updateScribingQuestion(scribingId, data);
  }

  submitButtonText() {
    const { isSubmitting } = this.props.data;
    const { formatMessage } = this.props.intl;
    return (isSubmitting) ?
           formatMessage(translations.submittingMessage) :
           formatMessage(translations.submitButton);
  }

  renderErrorMessage() {
    const errors = this.props.data.saveErrors;
    return errors && errors.length > 0 ?
      <div className="alert alert-danger">
        {errors.map(errorMessage => (<div key={errorMessage}>{errorMessage}</div>))}
      </div> : null
    ;
  }

  renderExistingAttachmentLabel() {
    return (
      <div className={styles.row}>
        <label htmlFor="question_scribing_attachment">
          File uploaded: {this.props.data.question.attachment_reference.name}
        </label>
      </div> : []
    );
  }

  renderSnackbars() {
    return (
      <div>
        <Snackbar
          open={this.props.invalid && this.props.submitFailed}
          message={this.props.intl.formatMessage(translations.resolveErrorsMessage)}
          autoHideDuration={5000}
        />
        <Snackbar
          open={(this.props.data.error
            && this.props.data.saveErrors
            && this.props.data.saveErrors.length > 0)
            || false
          }
          message={this.props.intl.formatMessage(translations.submitFailureMessage)}
          autoHideDuration={5000}
          onRequestClose={() => { this.props.actions.clearSubmitError(); }}
        />
        <Snackbar
          open={(this.props.data.error
            && this.props.data.saveErrors
            && this.props.data.saveErrors.length === 0)
            || false
          }
          message={this.props.intl.formatMessage(translations.fetchFailureMessage)}
          autoHideDuration={5000}
        />
        <Snackbar
          open={this.props.submitting}
          message={this.props.intl.formatMessage(translations.submittingMessage)}
          autoHideDuration={2000}
        />
      </div>
    );
  }

  render() {
    const { handleSubmit, submitting,
            intl, scribingId } = this.props;
    const question = this.props.data.question;
    const onSubmit = scribingId ? this.handleUpdateQuestion : this.handleCreateQuestion;

    const skillsOptions = question.skills;
    const skillsValues = question.skill_ids;

    // Field level validations
    const required = value => (
      value ? undefined : intl.formatMessage(translations.cannotBeBlankValidationError)
    );
    const lessThan1000 = value => (
      value && value >= 1000 ?
      intl.formatMessage(translations.valueMoreThanEqual1000Error) : undefined
    );
    const nonNegative = value => (
      value && value < 0 ?
      intl.formatMessage(translations.positiveNumberValidationError) : undefined
    );

    return (
      (this.props.data.isLoading) ? <LoadingIndicator /> :

      <div>
        { this.renderErrorMessage() }
        <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className={styles.inputContainer}>
            <div className={styles.titleInput}>
              <InputField
                label={this.props.intl.formatMessage(translations.titleFieldLabel)}
                field={'title'}
                required={false}
                type={'text'}
                placeholder={this.props.data.question.error && this.props.data.question.error.title}
                isLoading={this.props.data.isLoading}
                value={this.props.formValues
                  && this.props.formValues.question_scribing
                  && this.props.formValues.question_scribing.title
                }
              />
            </div>
            <div className={styles.descriptionInput}>
              <SummernoteField
                label={this.props.intl.formatMessage(translations.descriptionFieldLabel)}
                field={'description'}
                isLoading={this.props.data.isLoading}
              />
            </div>
            <div className={styles.staffCommentsInput}>
              <SummernoteField
                label={this.props.intl.formatMessage(translations.staffOnlyCommentsFieldLabel)}
                field={'staff_only_comments'}
                isLoading={this.props.data.isLoading}
              />
            </div>
            <div className={styles.skillsInput}>
              <MultiSelectSkillsField
                label={this.props.intl.formatMessage(translations.skillsFieldLabel)}
                field={'skill_ids'}
                value={skillsValues}
                options={skillsOptions}
                isLoading={this.props.data.isLoading}
                onSelectSkills={this.onSelectSkills}
              />
            </div>
            <div className={styles.maximumGradeInput}>
              <InputField
                label={this.props.intl.formatMessage(translations.maximumGradeFieldLabel)}
                field={'maximum_grade'}
                required
                validate={[required, lessThan1000, nonNegative]}
                type={'number'}
                isLoading={this.props.data.isLoading}
                value={ScribingQuestionForm.convertNull(
                  this.props.formValues
                  && this.props.formValues.question_scribing
                  && this.props.formValues.question_scribing.maximum_grade
                )}
              />
            </div>
            <div className={styles.fileInputDiv}>
              {
                this.props.data.question.attachment_reference
                  && this.props.data.question.attachment_reference.name ?
                this.renderExistingAttachmentLabel() :
                <div className={styles.row} >
                  <FileUploadField
                    field={'attachment'}
                    label={this.props.intl.formatMessage(translations.chooseFileButton)}
                    isLoading={this.props.data.isLoading}
                    validate={[required]}
                    errorMessage={this.props.intl.formatMessage(translations.fileAttachmentRequired)}
                  />
                  <div className={styles.warningText}>
                    {this.props.intl.formatMessage(translations.scribingQuestionWarning)}
                  </div>
                </div>
              }
            </div>
          </div>

          { this.renderSnackbars() }

          <RaisedButton
            className={styles.submitButton}
            label={this.submitButtonText()}
            labelPosition="before"
            primary
            type="submit"
            disabled={this.props.data.isLoading || submitting}
            icon={this.props.data.isSubmitting ? <i className="fa fa-spinner fa-lg fa-spin" /> : null}
          />
        </Form>
      </div>
    );
  }
}

ScribingQuestionForm.propTypes = propTypes;

export default reduxForm({
  form: formNames.QUESTION_SCRIBING,
  enableReinitialize: true,
})(injectIntl(ScribingQuestionForm));

