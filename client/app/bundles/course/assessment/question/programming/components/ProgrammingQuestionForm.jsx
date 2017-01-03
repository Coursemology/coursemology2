import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import ReactSummernote from 'react-summernote';
import { injectIntl } from 'react-intl';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import BuildLog from '../components/BuildLog';
import OnlineEditor, { validation as editorValidation } from '../components/OnlineEditor';
import UploadedPackageViewer from '../components/UploadedPackageViewer';
import ChipInput from '../../../../../../lib/components/ChipInput';

import styles from './ProgrammingQuestionForm.scss';
import translations from './ProgrammingQuestionForm.intl';

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: React.PropTypes.shape({
    submitForm: PropTypes.func.isRequired,
    updateProgrammingQuestion: PropTypes.func.isRequired,
    updateSkills: PropTypes.func.isRequired,
    updateEditorMode: PropTypes.func.isRequired,
    setValidationErrors: PropTypes.func.isRequired,
  }),
  onlineEditorActions: PropTypes.object.isRequired,
  templatePackageActions: PropTypes.object.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

function validation(data, pathOfKeysToData, intl) {
  const errors = [];
  const questionErrors = {};
  let hasError = false;

  // Check maximum grade
  if (!data.get('maximum_grade')) {
    questionErrors.maximum_grade =
      intl.formatMessage(translations.cannotBeBlankValidationError);
    hasError = true;
  }

  // Check language
  if (!data.get('language_id')) {
    questionErrors.language_id =
      intl.formatMessage(translations.cannotBeBlankValidationError);
    hasError = true;
  }

  // Check file uploaded when using Upload Package mode and no previous package exists
  if (!data.get('can_edit_online') &&
    data.get('package') === null && data.get('package_filename') === null) {
    questionErrors.package_filename =
      intl.formatMessage(translations.noPackageValidationError);
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

class ProgrammingQuestionForm extends React.Component {

  static handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  static getInputId(field) {
    return `question_programming_${field}`;
  }

  static convertNull(value) {
    return value === null ? '' : value;
  }

  static renderLabel(label, field, required) {
    const requiredNode = <abbr title="" data-original-title="required">*</abbr>;

    if (required) {
      return <label htmlFor={field}>{requiredNode} {label}</label>;
    }

    return <label htmlFor={field}>{label}</label>;
  }

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChipInputSkillsAdd = this.onChipInputSkillsAdd.bind(this);
    this.onChipInputSkillsDelete = this.onChipInputSkillsDelete.bind(this);
    this.onPackageUploadFileChange = this.onPackageUploadFileChange.bind(this);
  }

  componentDidMount() {
    this.summernoteEditors = $('#programmming-question-form .note-editor .note-editable');
  }

  componentWillReceiveProps(nextProps) {
    this.summernoteEditors.attr('contenteditable', !nextProps.data.get('is_loading'));
  }

  onChipInputSkillsAdd(chip) {
    const values = this.props.data.getIn(['question', 'skill_ids']);
    this.props.actions.updateSkills(values.push(Immutable.fromJS(chip)));
  }

  onChipInputSkillsDelete(id) {
    const values = this.props.data.getIn(['question', 'skill_ids']);
    this.props.actions.updateSkills(values.filterNot(v => v.get('id') === id));
  }

  onTestTypeChange(canEditOnline) {
    return (e) => {
      e.preventDefault();
      this.props.actions.updateProgrammingQuestion('can_edit_online', canEditOnline);
    };
  }

  onPackageUploadFileChange(e) {
    const files = e.target.files;
    const filename = files.length === 0 ? null : files[0].name;
    this.handleChange('package_filename', filename);
  }

  onSubmit(e) {
    if (!this.validationCheck()) {
      e.preventDefault();
      return;
    }
    const async = this.props.data.getIn(['form_data', 'async']);

    if (async) {
      e.preventDefault();

      const url = this.props.data.getIn(['form_data', 'path']);
      const method = this.props.data.getIn(['form_data', 'method']);
      const formData = new FormData(this.form);

      this.props.actions.submitForm(url, method, formData);
    }
  }

  validationCheck() {
    const { data, intl } = this.props;
    const question = data.get('question');
    let errors = validation(question, ['question'], intl);

    // Check online editor
    if (question.get('can_edit_online')) {
      errors = errors.concat(
        editorValidation(this.props.data.get('test_ui'), ['test_ui'], intl)
      );
    }

    this.props.actions.setValidationErrors(errors);

    return errors.length === 0;
  }

  handleChange(field, value) {
    this.props.actions.updateProgrammingQuestion(field, value === '' ? null : value);
  }

  summernoteHandler(field) {
    return e => this.props.actions.updateProgrammingQuestion(field, e === '' ? null : e);
  }

  languageHandler(field) {
    return (e, key, id) => {
      let mode = null;

      for (const language of this.props.data.getIn(['question', 'languages'])) {
        if (language.get('id') === id) {
          mode = language.get('editor_mode');
          break;
        }
        mode = null;
      }

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

  renderImportAlertView() {
    const alertData = this.props.data.get('import_result').get('alert');

    if (alertData) {
      return <div className={alertData.get('class')}>{alertData.get('message')}</div>;
    }

    return null;
  }

  renderInputField(label, field, required, type, value, error = null, placeholder = null) {
    return (
      <TextField
        type={type}
        name={ProgrammingQuestionForm.getInputName(field)}
        id={ProgrammingQuestionForm.getInputId(field)}
        onChange={(e, newValue) => { this.handleChange(field, newValue); }}
        hintText={placeholder}
        errorText={error}
        floatingLabelText={(required ? '* ' : '') + label}
        disabled={this.props.data.get('is_loading')}
        value={value}
        fullWidth
      />
    );
  }

  renderSummernoteField(label, field, required, value) {
    return (
      <div className="form-group" key={field}>
        { ProgrammingQuestionForm.renderLabel(label, field, required) }
        <textarea
          name={ProgrammingQuestionForm.getInputName(field)}
          id={ProgrammingQuestionForm.getInputId(field)}
          required={required}
          value={value}
          style={{ display: 'none' }}
          readOnly="true"
          disabled={this.props.data.get('is_loading')}
        />
        <ReactSummernote
          options={{ dialogsInBody: true, disabled: this.props.data.get('is_loading') }}
          value={value}
          onChange={this.summernoteHandler(field)}
        />
      </div>
    );
  }

  renderMultiSelectField(label, field, value, options, error) {
    return (
      <ChipInput
        id={ProgrammingQuestionForm.getInputId(field)}
        name={`${ProgrammingQuestionForm.getInputName(field)}[]`}
        value={value}
        dataSource={options}
        dataSourceConfig={{ value: 'id', text: 'title' }}
        onRequestAdd={this.onChipInputSkillsAdd}
        onRequestDelete={this.onChipInputSkillsDelete}
        floatingLabelText={label}
        openOnFocus
        fullWidth
        disabled={this.props.data.get('is_loading')}
        errorText={error}
      />
    );
  }

  renderDropdownSelectField(label, field, required, value, options, error, onChange) {
    return (
      <div key={field}>
        <input
          name={ProgrammingQuestionForm.getInputName(field)}
          type="text"
          value={value || ''}
          style={{ display: 'none' }}
          readOnly="true"
          disabled={this.props.data.get('is_loading')}
        />
        <SelectField
          floatingLabelText={(required ? '* ' : '') + label}
          value={value}
          onChange={onChange}
          disabled={this.props.data.get('is_loading')}
          errorText={error}
          fullWidth
        >
          {options}
        </SelectField>
      </div>
    );
  }

  renderSwitcher(showEditOnline, canSwitch) {
    if (!canSwitch) {
      return null;
    }

    return (
      <div className={styles.testSelection}>
        <hr className={styles.testSelectionRuler} />
        <div className="btn-group">
          <button
            type="button"
            className={`btn btn-${showEditOnline ? 'primary' : 'default'}`}
            onClick={this.onTestTypeChange(true)}
            disabled={this.props.data.get('is_loading')}
          >
            {this.props.intl.formatMessage(translations.editTestsOnlineButton)}
          </button>
          <button
            type="button"
            className={`btn btn-${showEditOnline ? 'default' : 'primary'}`}
            onClick={this.onTestTypeChange(false)}
            disabled={this.props.data.get('is_loading')}
          >
            {this.props.intl.formatMessage(translations.uploadPackageButton)}
          </button>
        </div>
      </div>
    );
  }

  renderPackageField(label, field, pkg, showEditOnline) {
    const downloadNode = pkg ?
      (<div>
        <strong>{this.props.intl.formatMessage(translations.downloadPackage)}: </strong>
        <a target="_blank" rel="noopener noreferrer" href={pkg.get('path')}>{pkg.get('name')}</a>
      </div>)
      :
      null;

    if (showEditOnline) {
      return <div className={styles.downloadPackage}>{downloadNode}</div>;
    }

    const packageError = this.props.data.getIn(['question', 'error', 'package_filename']);

    return (
      <div className={styles.downloadPackage}>
        { ProgrammingQuestionForm.renderLabel(label, field, false) }
        { downloadNode }
        {
          packageError ?
            <div className="text-danger"><strong>{packageError}</strong></div>
            :
            null
        }
        <input
          className="form-control"
          name={ProgrammingQuestionForm.getInputName(field)}
          id={ProgrammingQuestionForm.getInputId(field)}
          type="file"
          disabled={this.props.data.get('is_loading')}
          onChange={this.onPackageUploadFileChange}
        />
      </div>
    );
  }

  renderTestView() {
    if (this.props.data.getIn(['question', 'can_edit_online'])) {
      return (
        <OnlineEditor
          {...{
            actions: this.props.onlineEditorActions,
            data: this.props.data,
          }}
        />
      );
    }

    return (
      <UploadedPackageViewer
        {...{
          actions: this.props.templatePackageActions,
          data: this.props.data,
        }}
      />
    );
  }

  renderBuildLogView() {
    const buildLogData = this.props.data.getIn(['import_result', 'build_log']);

    if (buildLogData) {
      return <BuildLog {...{ buildLogData }} />;
    }

    return null;
  }

  render() {
    const question = this.props.data.get('question');
    const formData = this.props.data.get('form_data');
    const languages = question.get('languages');
    const pkg = question.get('package');
    const showAttemptLimit = question.get('show_attempt_limit');

    const skillsOptions = question.get('skills').toJS();
    const skillsValues = question.get('skill_ids').toJS();

    const languageOptions = languages.map(opt =>
      <MenuItem value={opt.get('id')} key={opt.get('id')} primaryText={opt.get('name')} />
    ).unshift(<MenuItem value={null} key="null" primaryText="" />);

    const showEditOnline = question.get('can_edit_online');

    return (
      <div>
        { this.renderImportAlertView() }
        <form
          id="programmming-question-form" action={formData.get('path')} method="post"
          onSubmit={this.onSubmit} ref={(form) => { this.form = form; }}
        >
          <input type="hidden" name="authenticity_token" value={formData.get('auth_token')} />

          {
            this.renderInputField(
              this.props.intl.formatMessage(translations.titleFieldLabel),
              'title', false, 'text', question.get('title') || '',
              this.props.data.getIn(['question', 'error', 'title']))
          }
          {
            this.renderSummernoteField(
              this.props.intl.formatMessage(translations.descriptionFieldLabel),
              'description', false, question.get('description') || '')
          }
          {
            this.renderSummernoteField(
              this.props.intl.formatMessage(translations.staffOnlyCommentsFieldLabel),
              'staff_only_comments', false, question.get('staff_only_comments') || '')
          }
          {
            this.renderInputField(
              this.props.intl.formatMessage(translations.maximumGradeFieldLabel),
              'maximum_grade', true, 'number',
              ProgrammingQuestionForm.convertNull(question.get('maximum_grade')),
              this.props.data.getIn(['question', 'error', 'maximum_grade']))
          }
          {
            this.renderMultiSelectField(
              this.props.intl.formatMessage(translations.skillsFieldLabel),
              'skill_ids', skillsValues, skillsOptions,
              this.props.data.getIn(['question', 'error', 'skill_ids']))
          }
          {
            this.renderDropdownSelectField(
              this.props.intl.formatMessage(translations.languageFieldLabel),
              'language_id', true, question.get('language_id') || undefined, languageOptions,
              this.props.data.getIn(['question', 'error', 'language_id']),
              this.languageHandler('language_id'))
          }
          {
            this.renderInputField(
              this.props.intl.formatMessage(translations.memoryLimitFieldLabel),
              'memory_limit', false, 'number',
              ProgrammingQuestionForm.convertNull(question.get('memory_limit')),
              this.props.data.getIn(['question', 'error', 'memory_limit']))
          }
          {
            this.renderInputField(this.props.intl.formatMessage(translations.timeLimitFieldLabel),
              'time_limit', false, 'number',
              ProgrammingQuestionForm.convertNull(question.get('time_limit')),
              this.props.data.getIn(['question', 'error', 'attempt_limit']))
          }
          {
            showAttemptLimit ?
              this.renderInputField(
                this.props.intl.formatMessage(translations.attemptLimitFieldLabel),
                'attempt_limit', false, 'number',
                ProgrammingQuestionForm.convertNull(question.get('attempt_limit')),
                this.props.data.getIn(['question', 'error', 'attempt_limit']),
                this.props.intl.formatMessage(translations.attemptLimitPlaceholderMessage))
              :
              null
          }

          { this.renderSwitcher(showEditOnline, question.get('can_switch_package_type')) }
          {
            this.renderPackageField(
              this.props.intl.formatMessage(translations.templatePackageFieldLabel),
              'file', pkg, showEditOnline)
          }
          { this.renderTestView() }
          { this.renderBuildLogView() }

          {
            this.props.data.get('has_errors') ?
              <div className="alert alert-danger">
                {this.props.intl.formatMessage(translations.resolveErrorsMessage)}
              </div>
              :
              null
          }
          <button className="btn btn-primary" type="submit" disabled={this.props.data.get('is_loading')}>
            { this.submitButtonText() }
            { this.props.data.get('is_loading') ? <i className="fa fa-spinner fa-lg fa-spin" /> : null }
          </button>
        </form>
      </div>
    );
  }
}

ProgrammingQuestionForm.propTypes = propTypes;

export default injectIntl(ProgrammingQuestionForm);
