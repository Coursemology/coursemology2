/* eslint-disable react/no-array-index-key */
import { Component } from 'react';
import { injectIntl } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { HelpOutline } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from '@mui/material';
import { blue, grey, red } from '@mui/material/colors';
import { Map } from 'immutable';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';

import BuildLog from '../../components/BuildLog';
import OnlineEditor, {
  validation as editorValidation,
} from '../../components/OnlineEditor';
import UploadedPackageView from '../../components/UploadedPackageView';

import translations from './ProgrammingQuestionForm.intl';
import styles from './ProgrammingQuestionForm.scss';

const propTypes = {
  data: PropTypes.instanceOf(Map).isRequired,
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
  intl: PropTypes.object.isRequired,
};

const DEFAULT_TIME_LIMIT = 10;

function validation(data, pathOfKeysToData, intl) {
  const errors = [];
  const questionErrors = {};
  let hasError = false;

  const HARD_TIME_LIMIT = data.get('max_time_limit');

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
      {
        hard_time_limit: HARD_TIME_LIMIT,
      },
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
  if (
    !data.get('edit_online') &&
    data.get('package') === null &&
    data.get('package_filename') === null
  ) {
    questionErrors.package_filename = intl.formatMessage(
      translations.noPackageValidationError,
    );
    hasError = true;
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

  onChangeSkills = (ids) => {
    const allSkills = this.props.data.getIn(['question', 'skills']);
    const updatedSkills = allSkills.filter((v) => ids.includes(v.get('id')));
    this.props.actions.updateSkills(updatedSkills);
  };

  onSubmit = (e) => {
    e.preventDefault();
    if (!this.validationCheck()) return;

    const autogradedAssessment = this.props.data.getIn([
      'question',
      'autograded_assessment',
    ]);
    const hasSubmissions = this.props.data.getIn([
      'question',
      'has_submissions',
    ]);
    const gamified = this.props.data.getIn(['question', 'course_gamified']);

    if (gamified && autogradedAssessment && hasSubmissions) {
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

  CKEditorHandler(field) {
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
      <MenuItem key={opt.id} value={opt.id}>
        {opt.name}
      </MenuItem>
    ));

    return (
      <div key={field}>
        <FormControl
          disabled={this.props.data.get('is_loading')}
          error={!!error}
          style={{ marginTop: 14, width: '100%' }}
          variant="standard"
        >
          <InputLabel shrink>{(required ? '* ' : '') + label}</InputLabel>
          <Select
            onChange={(event) => {
              onChange(event.target.value);
            }}
            value={value || ''}
            variant="standard"
          >
            {selectFieldOptions}
          </Select>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
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
          error={!!error}
          fullWidth
          helperText={error}
          id={ProgrammingQuestionForm.getInputId(field)}
          InputLabelProps={{
            shrink: true,
          }}
          label={(required ? '* ' : '') + label}
          name={ProgrammingQuestionForm.getInputName(field)}
          onChange={(event) => {
            this.handleChange(field, event.target.value);
          }}
          onWheel={
            type === 'number'
              ? (event) => event.currentTarget.blur()
              : undefined
          }
          style={{ marginTop: 14, width: '100%' }}
          type={type}
          value={value}
          variant="standard"
        />
      </div>
    );
  }

  renderMultiSelectSkillsField(label, field, value, options, error) {
    return (
      <div key={field}>
        <Autocomplete
          disabled={this.props.data.get('is_loading')}
          filterSelectedOptions
          fullWidth
          getOptionLabel={(option) => option.title}
          id={ProgrammingQuestionForm.getInputId(field)}
          isOptionEqualToValue={(option, val) => option.id === val.id}
          ListboxProps={{ style: { maxHeight: '80vh', overflowY: 'scroll' } }}
          multiple
          onChange={(event, val) => {
            const selectedOptionIds = val.map((option) => option.id);
            this.onChangeSkills(selectedOptionIds);
          }}
          options={options}
          renderInput={(params) => (
            <TextField
              {...params}
              error={!!error}
              helperText={error}
              InputLabelProps={{
                shrink: true,
              }}
              label={label}
              variant="standard"
            />
          )}
          value={value}
        />
        <select
          disabled={this.props.data.get('is_loading')}
          multiple
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
        <Button
          className={styles.fileInputButton}
          color="primary"
          disabled={this.props.data.get('is_loading')}
          variant="contained"
        >
          {newPackageButton}
          <input
            className={styles.uploadPackageInput}
            disabled={this.props.data.get('is_loading')}
            id={ProgrammingQuestionForm.getInputId(field)}
            name={ProgrammingQuestionForm.getInputName(field)}
            onChange={this.onPackageUploadFileChange}
            type="file"
          />
        </Button>
        <div style={{ display: 'inline-block' }}>
          {newFilename || noFileMessage}
        </div>
        <div style={{ color: red[500], whiteSpace: 'pre-wrap' }}>
          {packageError}
        </div>
      </>
    );
  }

  renderCKEditorField(label, field, required, value) {
    return (
      <CKEditorRichText
        disabled={this.props.data.get('is_loading')}
        field={field}
        inputId={ProgrammingQuestionForm.getInputId(field)}
        label={label}
        name={ProgrammingQuestionForm.getInputName(field)}
        onChange={this.CKEditorHandler(field)}
        required={required}
        value={value}
      />
    );
  }

  renderSwitcher(showEditOnline, canSwitch) {
    if (!canSwitch) {
      return null;
    }

    const onTestTypeChange = (event, value) => {
      if (this.props.data.get('is_loading')) return;
      this.props.actions.updateProgrammingQuestion(
        'edit_online',
        value === 'editor',
      );
    };

    return (
      <Tabs
        onChange={onTestTypeChange}
        style={{
          backgroundColor: grey[100],
          color: blue[500],
          margin: '1em 0',
        }}
        TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
        value={showEditOnline ? 'editor' : 'upload-package'}
        variant="fullWidth"
      >
        <Tab
          id="test-case-editor-tab"
          label={this.props.intl.formatMessage(
            translations.editTestsOnlineButton,
          )}
          value="editor"
        />
        <Tab
          id="upload-package-tab"
          label={this.props.intl.formatMessage(
            translations.uploadPackageButton,
          )}
          value="upload-package"
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
            isCodaveri: this.props.data.getIn(['question', 'is_codaveri']),
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
    const showIsCodaveri =
      !this.props.data.getIn(['question', 'autograded_assessment']) &&
      question.get('autograded');
    const enableCodaveri =
      this.props.data.getIn(['question', 'codaveri_enabled']) ||
      question.get('is_codaveri');

    const skillsOptions = question.get('skills').toJS();
    const skillsValues = question.get('skill_ids').toJS();

    const autogradedAssessment = question.get('autograded_assessment');
    const autograded = question.get('autograded');
    const isCodaveri = question.get('is_codaveri');
    const hasAutoGradings = question.get('has_auto_gradings');
    const disableSubmit = false;
    // const disableSubmit =
    // autograded
    // isCodaveri &&
    // question.get('existing_submissions_count') !== 0;
    let autogradedLabel = (
      <b>{this.props.intl.formatMessage(translations.autograded)}</b>
    );
    if (autogradedAssessment && !autograded) {
      autogradedLabel = (
        <div style={{ alignItems: 'center', display: 'flex' }}>
          <b>{this.props.intl.formatMessage(translations.autograded)}</b>
          <Tooltip
            title={this.props.intl.formatMessage(
              translations.autogradedAssessment,
            )}
          >
            <HelpOutline fontSize="small" />
          </Tooltip>
        </div>
      );
    } else if (hasAutoGradings) {
      autogradedLabel = (
        <div style={{ alignItems: 'center', display: 'flex' }}>
          <b>{this.props.intl.formatMessage(translations.autograded)}</b>
          <Tooltip
            title={this.props.intl.formatMessage(
              translations.autogradedToggleDisabled,
            )}
          >
            <HelpOutline fontSize="small" />
          </Tooltip>
        </div>
      );
    }

    const showEditOnline = question.get('edit_online');

    let languageOptions = languages.toJS();
    if (showIsCodaveri && isCodaveri) {
      languageOptions = languageOptions.filter(
        (language) =>
          language.editor_mode === 'python' && language.name !== 'Python 2.7',
      );
    }
    languageOptions.unshift({ id: null, name: null });

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
          <Stack>
            <div>
              {this.renderInputField(
                this.props.intl.formatMessage(translations.titleFieldLabel),
                'title',
                false,
                'text',
                question.get('title') || '',
                this.props.data.getIn(['question', 'error', 'title']),
              )}
            </div>
            <div>
              {this.renderCKEditorField(
                this.props.intl.formatMessage(
                  translations.descriptionFieldLabel,
                ),
                'description',
                false,
                question.get('description') || '',
              )}
            </div>
            <div>
              {this.renderCKEditorField(
                this.props.intl.formatMessage(
                  translations.staffOnlyCommentsFieldLabel,
                ),
                'staff_only_comments',
                false,
                question.get('staff_only_comments') || '',
              )}
            </div>
            <div>
              {this.renderMultiSelectSkillsField(
                this.props.intl.formatMessage(translations.skillsFieldLabel),
                'skill_ids',
                skillsValues,
                skillsOptions,
                this.props.data.getIn(['question', 'error', 'skill_ids']),
              )}
            </div>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <div style={{ width: '100%' }}>
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
              <div style={{ width: '100%' }}>
                {this.renderDropdownSelectField(
                  this.props.intl.formatMessage(
                    translations.languageFieldLabel,
                  ),
                  'language_id',
                  true,
                  question.get('language_id') || undefined,
                  languageOptions,
                  this.props.data.getIn(['question', 'error', 'language_id']),
                  this.languageHandler('language_id'),
                )}
              </div>
            </Stack>

            <div className={styles.autogradeToggle}>
              {this.props.data.getIn([
                'question',
                'display_autograded_toggle',
              ]) ? (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autograded}
                        color="primary"
                        onChange={(e) => {
                          if (hasAutoGradings) return;
                          this.handleChange('autograded', e.target.checked);
                        }}
                      />
                    }
                    disabled={
                      this.props.data.get('is_loading') || hasAutoGradings
                    }
                    label={autogradedLabel}
                    name={ProgrammingQuestionForm.getInputName('autograded')}
                  />
                  <input
                    id={ProgrammingQuestionForm.getInputId('autograded')}
                    name={ProgrammingQuestionForm.getInputName('autograded')}
                    readOnly={
                      this.props.data.get('is_loading') || hasAutoGradings
                    }
                    style={{ display: 'none' }}
                    type="hidden"
                    value={autograded}
                  />
                </>
              ) : null}
              {showIsCodaveri && (
                <>
                  <RadioGroup
                    disabled={this.props.data.get('is_loading')}
                    name={ProgrammingQuestionForm.getInputName('is_codaveri')}
                    onChange={(e_, mode) => {
                      this.handleChange('is_codaveri', mode === 'true');
                    }}
                    value={isCodaveri}
                  >
                    <div>
                      {this.props.intl.formatMessage(
                        translations.chooseEvaluator,
                      )}
                    </div>
                    <FormControlLabel
                      key={0}
                      control={<Radio style={{ padding: 0, marginLeft: 10 }} />}
                      label={
                        <b>
                          {this.props.intl.formatMessage(
                            translations.defaultEvaluator,
                          )}
                        </b>
                      }
                      value={false}
                    />
                    <FormControlLabel
                      key={1}
                      control={<Radio style={{ padding: 0, marginLeft: 10 }} />}
                      disabled={!enableCodaveri}
                      label={
                        <Tooltip
                          title={this.props.intl.formatMessage(
                            enableCodaveri
                              ? translations.codaveriTooltip
                              : translations.disableCodaveriTooltip,
                          )}
                        >
                          <div
                            style={{ alignItems: 'center', display: 'flex' }}
                          >
                            <b>
                              {this.props.intl.formatMessage(
                                translations.codaveriEvaluator,
                              )}
                            </b>
                            <HelpOutline fontSize="small" />
                          </div>
                        </Tooltip>
                      }
                      value
                    />
                  </RadioGroup>
                  <input
                    id={ProgrammingQuestionForm.getInputId('is_codaveri')}
                    name={ProgrammingQuestionForm.getInputName('is_codaveri')}
                    readOnly={this.props.data.get('is_loading')}
                    style={{ display: 'none' }}
                    type="hidden"
                    value={isCodaveri}
                  />
                </>
              )}
            </div>
            <Grid
              columns={{ xs: 1, sm: showAttemptLimit ? 3 : 2 }}
              columnSpacing={1}
              container
            >
              <Grid item xs={1}>
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
              </Grid>
              <Grid item xs={1}>
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
                        this.props.data.getIn([
                          'question',
                          'error',
                          'time_limit',
                        ]),
                      )
                    : null}
                </div>
              </Grid>
              <Grid item xs={1}>
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
                      this.props.data.getIn([
                        'question',
                        'error',
                        'attempt_limit',
                      ]),
                      this.props.intl.formatMessage(
                        translations.attemptLimitPlaceholderMessage,
                      ),
                    )}
                  </div>
                ) : null}
              </Grid>
            </Grid>
          </Stack>

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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={5000}
            message={this.props.intl.formatMessage(
              translations.resolveErrorsMessage,
            )}
            onClose={() => {
              this.props.actions.clearHasError();
            }}
            open={this.props.data.get('has_errors')}
          />
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={2000}
            message={this.props.data.get('submission_message')}
            onClose={() => {
              this.props.actions.clearSubmissionMessage();
            }}
            open={this.props.data.get('show_submission_message')}
          />
          <ReactTooltip id="disabled-submit-tooltip">
            {this.props.intl.formatMessage(translations.submitButtonTooltip)}
          </ReactTooltip>
          <div
            data-for="disabled-submit-tooltip"
            data-tip
            data-tip-disable={!disableSubmit}
          >
            <Button
              className={styles.submitButton}
              color="primary"
              disabled={this.props.data.get('is_loading') || disableSubmit}
              endIcon={
                this.props.data.get('is_loading') ? (
                  <i className="fa fa-spinner fa-lg fa-spin" />
                ) : null
              }
              id="programming-question-form-submit"
              type="submit"
              variant="contained"
            >
              {this.submitButtonText()}
            </Button>
          </div>
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
