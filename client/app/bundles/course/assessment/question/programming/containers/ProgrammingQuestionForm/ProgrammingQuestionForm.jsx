/* eslint-disable react/no-array-index-key */
import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Immutable from 'immutable';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import Snackbar from 'material-ui/Snackbar';
import { red500 } from 'material-ui/styles/colors';
import { Tab, Tabs } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import ChipInput from 'material-ui-chip-input';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import MaterialSummernote from 'lib/components/MaterialSummernote';

import BuildLog from '../../components/BuildLog';
import OnlineEditor, {
  validation as editorValidation,
} from '../../components/OnlineEditor';
import UploadedPackageView from '../../components/UploadedPackageView';

import translations from './ProgrammingQuestionForm.intl';
import styles from './ProgrammingQuestionForm.scss';

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
    questionErrors.maximum_grade = intl.formatMessage(
      translations.cannotBeBlankValidationError,
    );
    hasError = true;
  } else if (maximumGrade < 0) {
    questionErrors.maximum_grade = intl.formatMessage(
      translations.positiveNumberValidationError,
    );
    hasError = true;
  }

  // Check language
  if (!data.get('language_id')) {
    questionErrors.language_id = intl.formatMessage(
      translations.cannotBeBlankValidationError,
    );
    hasError = true;
  }

  // Check time limit
  const timeLimit = data.get('time_limit');
  if (timeLimit && (timeLimit > HARD_TIME_LIMIT || timeLimit <= 0)) {
    questionErrors.time_limit = intl.formatMessage(
      translations.timeLimitRangeValidationError,
    );
    hasError = true;
  }

  ['memory_limit', 'attempt_limit'].forEach((numberField) => {
    const value = data.get(numberField);

    if (value && value <= 0) {
      questionErrors[numberField] = intl.formatMessage(
        translations.lessThanEqualZeroValidationError,
      );
      hasError = true;
    }
  });

  // Check file uploaded when no previous package exists
  if (!data.get('edit_online')) {
    if (data.get('package') === null && data.get('package_filename') === null) {
      questionErrors.package_filename = intl.formatMessage(
        translations.noPackageValidationError,
      );
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

class ProgrammingQuestionForm extends Component {
  static convertNull(value) {
    return value === null ? '' : value;
  }

  static getInputId(field) {
    return `question_programming_${field}`;
  }

  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  constructor(props) {
    super(props);
    this.state = { confirmationOpen: false };
  }

  componentDidMount() {
    this.summernoteEditors = $(
      '#programming-question-form .note-editor .note-editable',
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.summernoteEditors.attr(
      'contenteditable',
      !nextProps.data.get('is_loading'),
    );
  }

  handleChange(field, value) {
    this.props.actions.updateProgrammingQuestion(
      field,
      value === '' ? null : value,
    );
  }

  onPackageUploadFileChange = (e) => {
    const files = e.target.files;
    const filename = files.length === 0 ? null : files[0].name;
    this.handleChange('package_filename', filename);
  };

  onSelectSkills = (id) => {
    const currentSkills = this.props.data.getIn(['question', 'skill_ids']);
    const currentSkillsWithoutId = currentSkills.filter(
      (v) => v.get('id') !== id,
    );

    if (currentSkills.size === currentSkillsWithoutId.size) {
      // id is for a new skill to be added
      const newSkill = this.props.data
        .getIn(['question', 'skills'])
        .filter((v) => v.get('id') === id)
        .first();

      if (newSkill) {
        this.props.actions.updateSkills(currentSkills.push(newSkill));
      }
    } else {
      // id is for a selected skill to be removed
      this.props.actions.updateSkills(currentSkillsWithoutId);
    }
  };

  onSubmit = (e) => {
    e.preventDefault();
    if (!this.validationCheck()) return;

    const autograded = this.props.data.getIn(['question', 'autograded']);
    const hasSubmissions = this.props.data.getIn([
      'question',
      'has_submissions',
    ]);

    if (autograded && hasSubmissions) {
      this.setState((prevState) => ({
        confirmationOpen: !prevState.confirmationOpen,
      }));
    } else {
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    const url = this.props.data.getIn(['form_data', 'path']);
    const method = this.props.data.getIn(['form_data', 'method']);

    // Fix for FormData bug on Safari 11.1, Coursemology/coursemology2#2962
    // Disable empty file inputs so that the constructed FormData does not contain any empty files
    const fileInputs = this.form.querySelectorAll(
      'input[type="file"]:not([disabled])',
    );
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

    const failureMessage = this.props.intl.formatMessage(
      translations.submitFailureMessage,
    );

    this.props.actions.submitForm(url, method, formData, failureMessage);
  };

  languageHandler(field) {
    return (id) => {
      let mode = null;

      this.props.data.getIn(['question', 'languages']).forEach((language) => {
        if (language.get('id') === id) {
          mode = language.get('editor_mode');
          return false;
        }
        return true;
      });

      this.props.actions.updateEditorMode(mode);
      this.handleChange(field, id);
    };
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

  summernoteHandler(field) {
    return (e) =>
      this.props.actions.updateProgrammingQuestion(field, e === '' ? null : e);
  }

  validationCheck() {
    const { data, intl } = this.props;
    const question = data.get('question');
    let errors = validation(question, ['question'], intl);

    // Check online editor
    if (question.get('edit_online')) {
      errors = errors.concat(
        editorValidation(this.props.data, ['test_ui'], intl),
      );
    }

    this.props.actions.setValidationErrors(errors);

    return errors.length === 0;
  }

  renderBuildLogView() {
    const data = this.props.data.getIn(['import_result', 'build_log']);

    if (data) {
      return <BuildLog {...{ data }} />;
    }

    return null;
  }

  renderDropdownSelectField(
    label,
    field,
    required,
    value,
    options,
    error,
    onChange,
  ) {
    const selectOptions = options.map((opt) => (
      <option key={opt.id} value={opt.id || ''}>
        {opt.name}
      </option>
    ));
    const selectFieldOptions = options.map((opt) => (
      <MenuItem key={opt.id} primaryText={opt.name} value={opt.id} />
    ));

    return (
      <div key={field}>
        <SelectField
          disabled={this.props.data.get('is_loading')}
          errorText={error}
          floatingLabelFixed={true}
          floatingLabelText={(required ? '* ' : '') + label}
          fullWidth={true}
          onChange={(e, key, id) => {
            onChange(id);
          }}
          value={value}
        >
          {selectFieldOptions}
        </SelectField>
        <select
          disabled={this.props.data.get('is_loading')}
          name={ProgrammingQuestionForm.getInputName(field)}
          onChange={(e) => {
            onChange(parseInt(e.target.value, 10) || null);
          }}
          style={{ display: 'none' }}
          value={value || ''}
        >
          {selectOptions}
        </select>
      </div>
    );
  }

  renderImportAlertView() {
    const alertData = this.props.data.get('import_result').get('alert');

    if (alertData) {
      return (
        <div className={alertData.get('class')}>{alertData.get('message')}</div>
      );
    }

    return null;
  }

  renderInputField(
    label,
    field,
    required,
    type,
    value,
    error = null,
    placeholder = null,
  ) {
    return (
      <div title={placeholder}>
        <TextField
          disabled={this.props.data.get('is_loading')}
          errorText={error}
          floatingLabelFixed={true}
          floatingLabelText={(required ? '* ' : '') + label}
          fullWidth={true}
          id={ProgrammingQuestionForm.getInputId(field)}
          name={ProgrammingQuestionForm.getInputName(field)}
          onChange={(e, newValue) => {
            this.handleChange(field, newValue);
          }}
          onWheel={type === 'number' && ((event) => event.currentTarget.blur())}
          type={type}
          value={value}
        />
      </div>
    );
  }

  renderMultiSelectSkillsField(label, field, value, options, error) {
    return (
      <div key={field}>
        <ChipInput
          dataSource={options}
          dataSourceConfig={{ value: 'id', text: 'title' }}
          disabled={this.props.data.get('is_loading')}
          errorText={error}
          floatingLabelFixed={true}
          floatingLabelText={label}
          fullWidth={true}
          id={ProgrammingQuestionForm.getInputId(field)}
          menuStyle={{ maxHeight: '80vh', overflowY: 'scroll' }}
          onRequestAdd={(chip) => {
            this.onSelectSkills(chip.id);
          }}
          onRequestDelete={this.onSelectSkills}
          openOnFocus={true}
          value={value}
        />
        <select
          disabled={this.props.data.get('is_loading')}
          multiple={true}
          name={`${ProgrammingQuestionForm.getInputName(
            'question_assessment',
          )}[${field}][]`}
          onChange={(e) => {
            this.onSelectSkills(parseInt(e.target.value, 10) || e.target.value);
          }}
          style={{ display: 'none' }}
          value={value.map((opt) => opt.id)}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.title}
            </option>
          ))}
        </select>
      </div>
    );
  }

  renderPackageField(label, field, pkg, newFilename, showEditOnline) {
    let downloadNode = null;

    if (pkg) {
      const uploadedPackageLabel = showEditOnline
        ? this.props.intl.formatMessage(translations.downloadPackageLabel)
        : this.props.intl.formatMessage(translations.uploadedPackageLabel);
      const name = pkg.get('updater_name');
      const author = showEditOnline
        ? this.props.intl.formatMessage(translations.packageUpdatedBy, { name })
        : this.props.intl.formatMessage(translations.packageUploadedBy, {
            name,
          });
      downloadNode = (
        <div className={styles.downloadPackageContainer}>
          <div>
            <span className={styles.uploadedPackageLabel}>
              {uploadedPackageLabel}:
            </span>
            <a href={pkg.get('path')} rel="noopener noreferrer" target="_blank">
              {pkg.get('name')}
            </a>
          </div>
          <div>{author}</div>
        </div>
      );
    }

    if (showEditOnline) {
      return downloadNode;
    }

    const packageError = this.props.data.getIn([
      'question',
      'error',
      'package_filename',
    ]);
    const newPackageButton = this.props.intl.formatMessage(
      translations.newPackageButton,
    );
    const noFileMessage = this.props.intl.formatMessage(
      translations.noFileChosenMessage,
    );

    return (
      <>
        <h3>{label}</h3>
        {downloadNode}
        <RaisedButton
          className={styles.fileInputButton}
          containerElement="label"
          disabled={this.props.data.get('is_loading')}
          label={newPackageButton}
          labelPosition="before"
          primary={true}
        >
          <input
            className={styles.uploadPackageInput}
            disabled={this.props.data.get('is_loading')}
            id={ProgrammingQuestionForm.getInputId(field)}
            name={ProgrammingQuestionForm.getInputName(field)}
            onChange={this.onPackageUploadFileChange}
            type="file"
          />
        </RaisedButton>
        <div style={{ display: 'inline-block' }}>
          {newFilename || noFileMessage}
        </div>
        <div style={{ color: red500, whiteSpace: 'pre-wrap' }}>
          {packageError}
        </div>
      </>
    );
  }

  renderSummernoteField(label, field, required, value) {
    return (
      <MaterialSummernote
        disabled={this.props.data.get('is_loading')}
        field={field}
        inputId={ProgrammingQuestionForm.getInputId(field)}
        label={label}
        name={ProgrammingQuestionForm.getInputName(field)}
        onChange={this.summernoteHandler(field)}
        required={required}
        value={value}
      />
    );
  }

  renderSwitcher(showEditOnline, canSwitch) {
    if (!canSwitch) {
      return null;
    }

    const onTestTypeChange = (editOnline) => {
      if (this.props.data.get('is_loading')) return;
      this.props.actions.updateProgrammingQuestion('edit_online', editOnline);
    };

    return (
      <Tabs
        onChange={onTestTypeChange}
        style={{ margin: '1em 0' }}
        value={showEditOnline}
      >
        <Tab
          id="test-case-editor-tab"
          label={this.props.intl.formatMessage(
            translations.editTestsOnlineButton,
          )}
          value={true}
        />
        <Tab
          id="upload-package-tab"
          label={this.props.intl.formatMessage(
            translations.uploadPackageButton,
          )}
          value={false}
        />
      </Tabs>
    );
  }

  renderTestView(showEditOnline) {
    if (showEditOnline) {
      return (
        <OnlineEditor
          {...{
            actions: this.props.onlineEditorActions,
            data: this.props.data.get('test_ui'),
            isLoading: this.props.data.get('is_loading'),
            autograded: this.props.data.getIn(['question', 'autograded']),
            autogradedAssessment: this.props.data.getIn([
              'question',
              'autograded_assessment',
            ]),
            hasSubmissions: this.props.data.getIn([
              'question',
              'has_submissions',
            ]),
          }}
        />
      );
    }

    return <UploadedPackageView {...{ data: this.props.data }} />;
  }

  render() {
    const question = this.props.data.get('question');
    const formData = this.props.data.get('form_data');
    const languages = question.get('languages');
    const pkg = question.get('package');
    const showAttemptLimit = !this.props.data.getIn([
      'question',
      'autograded_assessment',
    ]);

    const skillsOptions = question.get('skills').toJS();
    const skillsValues = question.get('skill_ids').toJS();

    const languageOptions = languages.toJS();
    languageOptions.unshift({ id: null, name: null });

    const autogradedAssessment = question.get('autograded_assessment');
    const autograded = question.get('autograded');
    const hasAutoGradings = question.get('has_auto_gradings');
    let autogradedLabel = this.props.intl.formatMessage(
      translations.autograded,
    );
    if (autogradedAssessment && !autograded) {
      autogradedLabel += ` (${this.props.intl.formatMessage(
        translations.autogradedAssessment,
      )})`;
    } else if (hasAutoGradings) {
      autogradedLabel += ` (${this.props.intl.formatMessage(
        translations.autogradedToggleDisabled,
      )})`;
    }

    const showEditOnline = question.get('edit_online');

    return (
      <div>
        {this.renderImportAlertView()}
        {this.props.data.get('save_errors') ? (
          <div className="alert alert-danger">
            {this.props.data.get('save_errors').map((errorMessage, index) => (
              <div key={index}>{errorMessage}</div>
            ))}
          </div>
        ) : null}
        <form
          ref={(form) => {
            this.form = form;
          }}
          action={formData.get('path')}
          encType="multipart/form-data"
          id="programming-question-form"
          method="post"
          onSubmit={this.onSubmit}
        >
          <input
            name="authenticity_token"
            type="hidden"
            value={formData.get('auth_token')}
          />

          <div className={styles.inputContainer}>
            <div className={styles.titleInput}>
              {this.renderInputField(
                this.props.intl.formatMessage(translations.titleFieldLabel),
                'title',
                false,
                'text',
                question.get('title') || '',
                this.props.data.getIn(['question', 'error', 'title']),
              )}
            </div>
            <div className={styles.descriptionInput}>
              {this.renderSummernoteField(
                this.props.intl.formatMessage(
                  translations.descriptionFieldLabel,
                ),
                'description',
                false,
                question.get('description') || '',
              )}
            </div>
            <div className={styles.staffCommentsInput}>
              {this.renderSummernoteField(
                this.props.intl.formatMessage(
                  translations.staffOnlyCommentsFieldLabel,
                ),
                'staff_only_comments',
                false,
                question.get('staff_only_comments') || '',
              )}
            </div>
            <div className={styles.skillsInput}>
              {this.renderMultiSelectSkillsField(
                this.props.intl.formatMessage(translations.skillsFieldLabel),
                'skill_ids',
                skillsValues,
                skillsOptions,
                this.props.data.getIn(['question', 'error', 'skill_ids']),
              )}
            </div>
            <div className={styles.maximumGradeInput}>
              {this.renderInputField(
                this.props.intl.formatMessage(
                  translations.maximumGradeFieldLabel,
                ),
                'maximum_grade',
                true,
                'number',
                ProgrammingQuestionForm.convertNull(
                  question.get('maximum_grade'),
                ),
                this.props.data.getIn(['question', 'error', 'maximum_grade']),
              )}
            </div>
            <div className={styles.languageInput}>
              {this.renderDropdownSelectField(
                this.props.intl.formatMessage(translations.languageFieldLabel),
                'language_id',
                true,
                question.get('language_id') || undefined,
                languageOptions,
                this.props.data.getIn(['question', 'error', 'language_id']),
                this.languageHandler('language_id'),
              )}
            </div>
            <div className={styles.autogradeToggle}>
              {this.props.data.getIn([
                'question',
                'display_autograded_toggle',
              ]) ? (
                <Toggle
                  disabled={this.props.data.get('is_loading')}
                  label={autogradedLabel}
                  labelPosition="right"
                  name="question_programming[autograded]"
                  onToggle={(e) => {
                    if (hasAutoGradings) return;
                    this.handleChange('autograded', e.target.checked);
                  }}
                  readOnly={hasAutoGradings}
                  style={{ margin: '1em 0' }}
                  toggled={autograded}
                />
              ) : null}
            </div>
            <div className={styles.memoryLimitInput}>
              {autograded
                ? this.renderInputField(
                    this.props.intl.formatMessage(
                      translations.memoryLimitFieldLabel,
                    ),
                    'memory_limit',
                    false,
                    'number',
                    ProgrammingQuestionForm.convertNull(
                      question.get('memory_limit'),
                    ),
                    this.props.data.getIn([
                      'question',
                      'error',
                      'memory_limit',
                    ]),
                  )
                : null}
            </div>
            <div className={styles.timeLimitInput}>
              {autograded
                ? this.renderInputField(
                    this.props.intl.formatMessage(
                      translations.timeLimitFieldLabel,
                    ),
                    'time_limit',
                    false,
                    'number',
                    question.get('time_limit') === null
                      ? DEFAULT_TIME_LIMIT
                      : question.get('time_limit'),
                    this.props.data.getIn(['question', 'error', 'time_limit']),
                  )
                : null}
            </div>
            {autograded && showAttemptLimit ? (
              <div className={styles.attemptLimitInput}>
                {this.renderInputField(
                  this.props.intl.formatMessage(
                    translations.attemptLimitFieldLabel,
                  ),
                  'attempt_limit',
                  false,
                  'number',
                  ProgrammingQuestionForm.convertNull(
                    question.get('attempt_limit'),
                  ),
                  this.props.data.getIn(['question', 'error', 'attempt_limit']),
                  this.props.intl.formatMessage(
                    translations.attemptLimitPlaceholderMessage,
                  ),
                )}
              </div>
            ) : null}
          </div>

          {this.renderSwitcher(
            showEditOnline,
            question.get('can_switch_package_type') && autograded,
          )}
          {this.renderPackageField(
            this.props.intl.formatMessage(
              translations.templatePackageFieldLabel,
            ),
            'file',
            pkg,
            this.props.data.getIn(['question', 'package_filename']),
            showEditOnline,
          )}
          {this.renderTestView(showEditOnline)}
          {this.renderBuildLogView()}

          <Snackbar
            autoHideDuration={5000}
            message={this.props.intl.formatMessage(
              translations.resolveErrorsMessage,
            )}
            onRequestClose={() => {
              this.props.actions.clearHasError();
            }}
            open={this.props.data.get('has_errors')}
          />
          <Snackbar
            autoHideDuration={2000}
            message={this.props.data.get('submission_message')}
            onRequestClose={() => {
              this.props.actions.clearSubmissionMessage();
            }}
            open={this.props.data.get('show_submission_message')}
          />
          <RaisedButton
            className={styles.submitButton}
            disabled={this.props.data.get('is_loading')}
            icon={
              this.props.data.get('is_loading') ? (
                <i className="fa fa-spinner fa-lg fa-spin" />
              ) : null
            }
            id="programming-question-form-submit"
            label={this.submitButtonText()}
            labelPosition="before"
            primary={true}
            type="submit"
          />
          {this.state.confirmationOpen && (
            <ConfirmationDialog
              message={this.props.intl.formatMessage(
                translations.submitConfirmation,
              )}
              onCancel={() => this.setState({ confirmationOpen: false })}
              onConfirm={() => {
                this.handleSubmit();
                this.setState({ confirmationOpen: false });
              }}
              open={this.state.confirmationOpen}
            />
          )}
        </form>
      </div>
    );
  }
}

ProgrammingQuestionForm.propTypes = propTypes;

export default injectIntl(ProgrammingQuestionForm);
