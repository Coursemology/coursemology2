import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';
import { Form, reduxForm } from 'redux-form';

import LoadingIndicator from 'lib/components/LoadingIndicator';

import FileUploadField from '../../components/FileUploadField';
import InputField from '../../components/InputField';
import MultiSelectSkillsField from '../../components/MultiSelectSkillsField';
import SummernoteField from '../../components/SummernoteField';
import { formNames } from '../../constants';
import { dataShape, questionShape } from '../../propTypes';

import translations from './ScribingQuestionForm.intl';
import styles from './ScribingQuestionForm.scss';

const propTypes = {
  actions: PropTypes.shape({
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

// Field level validations
const validations = {
  fileRequired: (options) =>
    options && options.file ? undefined : translations.fileAttachmentRequired,
  required: (value) =>
    value ? undefined : translations.cannotBeBlankValidationError,
  lessThan1000: (value) =>
    value && value >= 1000
      ? translations.valueMoreThanEqual1000Error
      : undefined,
  nonNegative: (value) =>
    value && value < 0 ? translations.positiveNumberValidationError : undefined,
};

class ScribingQuestionForm extends Component {
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
    this.summernoteEditors = $(
      '#scribing-question-form .note-editor .note-editable',
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.summernoteEditors.attr('contenteditable', !nextProps.data.isLoading);
  }

  handleCreateQuestion = (data) => {
    const { createScribingQuestion } = this.props.actions;
    return createScribingQuestion(data);
  };

  handleUpdateQuestion = (data) => {
    const { scribingId } = this.props;
    const { updateScribingQuestion } = this.props.actions;

    return updateScribingQuestion(scribingId, data);
  };

  submitButtonText() {
    const { isSubmitting } = this.props.data;
    const { formatMessage } = this.props.intl;
    return isSubmitting
      ? formatMessage(translations.submittingMessage)
      : formatMessage(translations.submitButton);
  }

  renderErrorMessage() {
    const errors = this.props.data.saveErrors;
    return errors && errors.length > 0 ? (
      <div className="alert alert-danger">
        {errors.map((errorMessage) => (
          <div key={errorMessage}>{errorMessage}</div>
        ))}
      </div>
    ) : null;
  }

  renderExistingAttachment() {
    return (
      <div className={styles.row}>
        <label htmlFor="question_scribing_attachment">File uploaded:</label>
        <img
          alt={this.props.data.question.attachment_reference.name}
          className={styles.uploadedImage}
          src={this.props.data.question.attachment_reference.image_url}
        />
      </div>
    );
  }

  renderSnackbars() {
    return (
      <>
        <Snackbar
          autoHideDuration={5000}
          message={this.props.intl.formatMessage(
            translations.resolveErrorsMessage,
          )}
          open={this.props.invalid && this.props.submitFailed}
        />
        <Snackbar
          autoHideDuration={5000}
          message={this.props.intl.formatMessage(
            translations.submitFailureMessage,
          )}
          onRequestClose={() => {
            this.props.actions.clearSubmitError();
          }}
          open={
            (this.props.data.error &&
              this.props.data.saveErrors &&
              this.props.data.saveErrors.length > 0) ||
            false
          }
        />
        <Snackbar
          autoHideDuration={5000}
          message={this.props.intl.formatMessage(
            translations.fetchFailureMessage,
          )}
          open={
            (this.props.data.error &&
              this.props.data.saveErrors &&
              this.props.data.saveErrors.length === 0) ||
            false
          }
        />
        <Snackbar
          autoHideDuration={2000}
          message={this.props.intl.formatMessage(
            translations.submittingMessage,
          )}
          open={this.props.submitting}
        />
      </>
    );
  }

  render() {
    const { handleSubmit, submitting, scribingId } = this.props;
    const question = this.props.data.question;
    const onSubmit = scribingId
      ? this.handleUpdateQuestion
      : this.handleCreateQuestion;

    const skillsOptions = question.skills;
    const skillsValues = question.skill_ids;

    return this.props.data.isLoading ? (
      <LoadingIndicator />
    ) : (
      <>
        {this.renderErrorMessage()}
        <Form encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputContainer}>
            <div className={styles.titleInput}>
              <InputField
                field="title"
                isLoading={this.props.data.isLoading}
                label={this.props.intl.formatMessage(
                  translations.titleFieldLabel,
                )}
                placeholder={
                  this.props.data.question.error &&
                  this.props.data.question.error.title
                }
                required={false}
                type="text"
                value={
                  this.props.formValues &&
                  this.props.formValues.question_scribing &&
                  this.props.formValues.question_scribing.title
                }
              />
            </div>
            <div className={styles.descriptionInput}>
              <SummernoteField
                field="description"
                isLoading={this.props.data.isLoading}
                label={this.props.intl.formatMessage(
                  translations.descriptionFieldLabel,
                )}
              />
            </div>
            <div className={styles.staffCommentsInput}>
              <SummernoteField
                field="staff_only_comments"
                isLoading={this.props.data.isLoading}
                label={this.props.intl.formatMessage(
                  translations.staffOnlyCommentsFieldLabel,
                )}
              />
            </div>
            <div className={styles.skillsInput}>
              <MultiSelectSkillsField
                field="skill_ids"
                isLoading={this.props.data.isLoading}
                label={this.props.intl.formatMessage(
                  translations.skillsFieldLabel,
                )}
                options={skillsOptions}
                value={skillsValues}
              />
            </div>
            <div className={styles.maximumGradeInput}>
              <InputField
                field="maximum_grade"
                isLoading={this.props.data.isLoading}
                label={this.props.intl.formatMessage(
                  translations.maximumGradeFieldLabel,
                )}
                required={true}
                type="number"
                validate={[
                  validations.required,
                  validations.lessThan1000,
                  validations.nonNegative,
                ]}
                value={ScribingQuestionForm.convertNull(
                  this.props.formValues &&
                    this.props.formValues.question_scribing &&
                    this.props.formValues.question_scribing.maximum_grade,
                )}
              />
            </div>
            <div className={styles.fileInputDiv}>
              {this.props.data.question.attachment_reference &&
              this.props.data.question.attachment_reference.name ? (
                this.renderExistingAttachment()
              ) : (
                <div className={styles.row}>
                  <FileUploadField
                    field="attachment"
                    isLoading={this.props.data.isLoading}
                    label={this.props.intl.formatMessage(
                      translations.chooseFileButton,
                    )}
                    validate={validations.fileRequired}
                  />
                  <div className={styles.warningText}>
                    {this.props.intl.formatMessage(
                      translations.scribingQuestionWarning,
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {this.renderSnackbars()}

          <RaisedButton
            className={styles.submitButton}
            disabled={this.props.data.isLoading || submitting}
            icon={
              this.props.data.isSubmitting ? (
                <i className="fa fa-spinner fa-lg fa-spin" />
              ) : null
            }
            label={this.submitButtonText()}
            labelPosition="before"
            primary={true}
            type="submit"
          />
        </Form>
      </>
    );
  }
}

ScribingQuestionForm.propTypes = propTypes;

export default reduxForm({
  form: formNames.QUESTION_SCRIBING,
  enableReinitialize: true,
})(injectIntl(ScribingQuestionForm));
