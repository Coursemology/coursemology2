import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import ReactSummernote from 'react-summernote';
import Select from 'react-select';
import { injectIntl } from 'react-intl';

import 'react-select/dist/react-select.css';

import styles from './ProgrammingQuestionForm.scss';
import { programmingQuestionFormTranslations as translations } from '../constants/translations';

const propTypes = {
  data: React.PropTypes.shape({
    question: PropTypes.instanceOf(Immutable.Map).isRequired,
    formData: PropTypes.instanceOf(Immutable.Map).isRequired,
    isLoading: PropTypes.bool.isRequired,
    isEvaluating: PropTypes.bool.isRequired,
  }),
  actions: React.PropTypes.shape({
    submitForm: PropTypes.func.isRequired,
    updateProgrammingQuestion: PropTypes.func.isRequired,
    updateSkills: PropTypes.func.isRequired,
    updateEditorMode: PropTypes.func.isRequired,
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  buildLogView: PropTypes.element,
  importAlertView: PropTypes.element,
  testView: PropTypes.element,
};

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
    this.onSkillsChange = this.onSkillsChange.bind(this);
  }

  componentDidMount() {
    this.summernoteEditors = $('#programmming-question-form .note-editor .note-editable');
  }

  componentWillReceiveProps(nextProps) {
    this.summernoteEditors.attr('contenteditable', !nextProps.data.isLoading);
  }

  onChange(field) {
    return e => this.handleChange(field, e.target.value);
  }

  onSkillsChange(values) {
    this.props.actions.updateSkills(values.map(e => e.value));
  }

  onTestTypeChange(canEditOnline) {
    return (e) => {
      e.preventDefault();
      this.props.actions.updateProgrammingQuestion('can_edit_online', canEditOnline);
    };
  }

  onSubmit(e) {
    const async = this.props.data.formData.get('async');

    if (async) {
      e.preventDefault();

      const url = this.props.data.formData.get('path');
      const method = this.props.data.formData.get('method');
      const formData = new FormData(this.form);

      this.props.actions.submitForm(url, method, formData);
    }
  }

  handleChange(field, value) {
    this.props.actions.updateProgrammingQuestion(field, value === '' ? null : value);
  }

  summernoteHandler(field) {
    return e => this.props.actions.updateProgrammingQuestion(field, e === '' ? null : e);
  }

  languageHandler(field) {
    return (e) => {
      let mode = null;
      const id = parseInt(e.target.value, 10);

      for (const language of this.props.data.question.get('languages')) {
        if (language.get('id') === id) {
          mode = language.get('editor_mode');
          break;
        }
        mode = null;
      }

      this.props.actions.updateEditorMode(mode);
      this.handleChange(field, e.target.value);
    };
  }

  submitButtonText() {
    if (this.props.data.isEvaluating) {
      return this.props.intl.formatMessage(translations.evaluatingMessage);
    }

    if (this.props.data.isLoading) {
      return this.props.intl.formatMessage(translations.loadingMessage);
    }

    return this.props.intl.formatMessage(translations.submitButton);
  }

  renderInputField(label, field, required, type, value, placeholder = null) {
    return (
      <div className="form-group" key={field}>
        { ProgrammingQuestionForm.renderLabel(label, field, required) }
        <input
          className="form-control"
          type={type}
          name={ProgrammingQuestionForm.getInputName(field)}
          id={ProgrammingQuestionForm.getInputId(field)}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={this.onChange(field)}
          onKeyPress={ProgrammingQuestionForm.handleKeyPress}
          disabled={this.props.data.isLoading}
        />
      </div>
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
          disabled={this.props.data.isLoading}
        />
        <ReactSummernote
          options={{ dialogsInBody: true, disabled: this.props.data.isLoading }}
          value={value}
          onChange={this.summernoteHandler(field)}
        />
      </div>
    );
  }

  renderMultiSelectField(label, field, value, options, onChange) {
    return (
      <div className="form-group" key={field}>
        { ProgrammingQuestionForm.renderLabel(label, field, false) }
        <Select
          name={`${ProgrammingQuestionForm.getInputName(field)}[]`}
          id={ProgrammingQuestionForm.getInputId(field)}
          multi
          value={value}
          options={options}
          onChange={onChange}
          disabled={this.props.data.isLoading}
        />
      </div>
    );
  }

  renderDropdownSelectField(label, field, required, value, options, onChange) {
    return (
      <div className="form-group" key={field}>
        { ProgrammingQuestionForm.renderLabel(label, field, required) }
        <select
          className="form-control"
          required={required}
          name={ProgrammingQuestionForm.getInputName(field)}
          id={ProgrammingQuestionForm.getInputId(field)}
          value={value}
          onChange={onChange}
          onKeyPress={ProgrammingQuestionForm.handleKeyPress}
          disabled={this.props.data.isLoading}
        >
          { options }
        </select>
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
            disabled={this.props.data.isLoading}
          >
            {this.props.intl.formatMessage(translations.editTestsOnlineButton)}
          </button>
          <button
            type="button"
            className={`btn btn-${showEditOnline ? 'default' : 'primary'}`}
            onClick={this.onTestTypeChange(false)}
            disabled={this.props.data.isLoading}
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
      return downloadNode;
    }

    return (
      <div className="form-group" key={field}>
        { ProgrammingQuestionForm.renderLabel(label, field, false) }
        { downloadNode }
        <input
          className="form-control"
          name={ProgrammingQuestionForm.getInputName(field)}
          id={ProgrammingQuestionForm.getInputId(field)}
          type="file"
          disabled={this.props.data.isLoading}
        />
      </div>
    );
  }

  render() {
    const { question, formData } = this.props.data;
    const languages = question.get('languages');
    const pkg = question.get('package');
    const showAttemptLimit = question.get('show_attempt_limit');

    const skillsOptions = question.get('skills').toArray().map(skill => ({ value: skill.get('id'), label: skill.get('title') }));
    const skillsValues = question.get('skill_ids').toArray();

    const languageOptions = languages.map(opt => <option value={opt.get('id')} key={opt.get('id')}>{opt.get('name')}</option>).unshift(<option value={null} key="null" />);

    const showEditOnline = question.get('can_edit_online');

    return (
      <div>
        { this.props.importAlertView }
        <form
          id="programmming-question-form" action={formData.get('path')} method="post"
          onSubmit={this.onSubmit} ref={(form) => { this.form = form; }}
        >
          <input type="hidden" name="authenticity_token" value={formData.get('auth_token')} />

          {
            this.renderInputField(
              this.props.intl.formatMessage(translations.titleFieldLabel),
              'title', false, 'text', question.get('title') || '')
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
              ProgrammingQuestionForm.convertNull(question.get('maximum_grade')))
          }
          {
            this.renderMultiSelectField(
              this.props.intl.formatMessage(translations.skillsFieldLabel),
              'skill_ids', skillsValues, skillsOptions, this.onSkillsChange)
          }
          {
            this.renderDropdownSelectField(
              this.props.intl.formatMessage(translations.languageFieldLabel),
              'language_id', true, question.get('language_id') || undefined, languageOptions,
              this.languageHandler('language_id'))
          }
          {
            this.renderInputField(
              this.props.intl.formatMessage(translations.memoryLimitFieldLabel),
              'memory_limit', false, 'number',
              ProgrammingQuestionForm.convertNull(question.get('memory_limit')))
          }
          {
            this.renderInputField(this.props.intl.formatMessage(translations.timeLimitFieldLabel),
              'time_limit', false, 'number',
              ProgrammingQuestionForm.convertNull(question.get('time_limit')))
          }
          {
            showAttemptLimit ?
              this.renderInputField(
                this.props.intl.formatMessage(translations.attemptLimitFieldLabel),
                'attempt_limit', false, 'number',
                ProgrammingQuestionForm.convertNull(question.get('attempt_limit')),
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
          { this.props.testView }
          { this.props.buildLogView }

          <button className="btn btn-primary" type="submit" disabled={this.props.data.isLoading}>
            { this.submitButtonText() }
            { this.props.data.isLoading ? <i className="fa fa-spinner fa-lg fa-spin" /> : null }
          </button>
        </form>
      </div>
    );
  }
}

ProgrammingQuestionForm.propTypes = propTypes;

export default injectIntl(ProgrammingQuestionForm);
