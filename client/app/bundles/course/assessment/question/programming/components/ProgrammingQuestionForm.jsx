import React, { PropTypes } from 'react';
import ReactSummernote from 'react-summernote';
import Select from 'react-select';
import { injectIntl, defineMessages } from 'react-intl';
import styles from './ProgrammingQuestionForm.scss'

import 'react-select/dist/react-select.css';

const translations = defineMessages({
  attemptLimitPlaceholderMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.attemptLimitPlaceholderMessage',
    defaultMessage: 'The maximum times that the students can test their answers (does not apply to staff)',
    description: 'Placeholder message for attempt limit input field.',
  },
  downloadPackage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.downloadPackage',
    defaultMessage: 'Download Package',
    description: 'Title for downloading the zip package.',
  },
  editTestsOnlineButton: {
    id: 'course.assessment.question.programming.programmingQuestionForm.editTestsOnlineButton',
    defaultMessage: 'Edit Tests Online',
    description: 'Button for editing tests online.',
  },
  uploadPackageButton: {
    id: 'course.assessment.question.programming.programmingQuestionForm.uploadPackageButton',
    defaultMessage: 'Upload Package',
    description: 'Button for uploading package.',
  },
  submitButton: {
    id: 'course.assessment.question.programming.programmingQuestionForm.submitButton',
    defaultMessage: 'Submit',
    description: 'Button for submitting the form.',
  },
  evaluatingMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.evaluatingMessage',
    defaultMessage: 'Evaluating',
    description: 'Text to be displayed when evaluating the programming question.',
  },
  loadingMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.loadingMessage',
    defaultMessage: 'Loading',
    description: 'Text to be displayed when waiting for server response after form submission.',
  },
});

const propTypes = {
  data: React.PropTypes.shape({
    question: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isEvaluating: PropTypes.bool.isRequired
  }),
  actions: React.PropTypes.shape({
    updateProgrammingQuestion: PropTypes.func.isRequired,
    updateSkills: PropTypes.func.isRequired,
    updateEditorMode: PropTypes.func.isRequired
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class ProgrammingQuestionForm extends React.Component {

  componentWillReceiveProps(nextProps) {
    this.isLoading = nextProps.data.isLoading;
    this.isEvaluating = nextProps.data.isEvaluating;
  }

  handleChange(field, e) {
    var value = e.target.value;
    if (value == "") {
      value = null
    }
    this.props.actions.updateProgrammingQuestion(field, value);
  }

  onSummernoteChange(field, e) {
    this.props.actions.updateProgrammingQuestion(field, e == "" ? null : e);
  }

  onLanguageChange(field, e) {
    var mode = null;
    var id = parseInt(e.target.value);

    for (let language of this.props.data.question.get('languages')) {
      if (language.get('id') === id) {
        mode = language.get('editor_mode');
        break;
      }
      mode = null;
    }

    this.props.actions.updateEditorMode(mode);
    this.handleChange(field, e);
  }

  onSkillsChange(values) {
    this.props.actions.updateSkills(values.map(e => e.value));
  }

  onTestTypeChange(can_edit_online, e) {
    this.props.actions.updateProgrammingQuestion('can_edit_online', can_edit_online);
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

  handleKeyPress = (event) => {
    if(event.key == 'Enter'){
      event.preventDefault();
    }
  };

  getInputName = (field) => {
    return `question_programming[${field}]`
  };

  getInputId = (field) => {
    return `question_programming_${field}`
  };

  convertNull = (value) => {
    return value == null ? '' : value;
  };

  renderLabel = (label, required) => {
    const requiredNode = <abbr title="" data-original-title="required">*</abbr>;

    if (required) {
      return <label>{requiredNode} {label}</label>;
    } else {
      return <label>{label}</label>;
    }
  };

  renderInputField(field, label, required, type, value, placeholder=null) {
    return (
      <div className="form-group" key={field}>
        { this.renderLabel(label, required) }
        <input className="form-control"
               type={type}
               name={this.getInputName(field)}
               id={this.getInputId(field)}
               required={required}
               value={value}
               placeholder={placeholder}
               onChange={this.handleChange.bind(this, field)}
               onKeyPress={this.handleKeyPress}
               disabled={this.isLoading}
        />
      </div>
    );
  }

  renderSummernoteField(field, label, required, value) {
    return (
      <div className="form-group" key={field}>
        { this.renderLabel(label, required) }
        <textarea name={this.getInputName(field)}
                  id={this.getInputId(field)}
                  required={required}
                  value={value}
                  style={{display: 'none'}}
                  readOnly="true"
                  disabled={this.isLoading}
        />
        <ReactSummernote options={{ dialogsInBody: true, disabled: this.isLoading }}
                         value={value}
                         onChange={this.onSummernoteChange.bind(this, field)}
        />
      </div>
    );
  }

  renderMultiSelectField(field, label, value, options, onChange) {
    return (
      <div className="form-group" key={field}>
        { this.renderLabel(label, false) }
        <Select
          name={`${this.getInputName(field)}[]`}
          id={this.getInputId(field)}
          multi={true}
          value={value}
          options={options}
          onChange={onChange.bind(this)}
          disabled={this.isLoading}
        />
      </div>
    );
  }

  renderDropdownSelectField(field, label, required, value, options, onChange) {
    return (
      <div className="form-group" key={field}>
        { this.renderLabel(label, required) }
        <select className="form-control"
                required={required}
                name={this.getInputName(field)}
                id={this.getInputId(field)}
                value={value}
                onChange={onChange.bind(this, field)}
                onKeyPress={this.handleKeyPress}
                disabled={this.isLoading}
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
          <button type="button"
                  className={`btn btn-${showEditOnline ? 'primary' : 'default'}`}
                  onClick={this.onTestTypeChange.bind(this, true)}
                  disabled={this.isLoading}
          >
            {this.props.intl.formatMessage(translations.editTestsOnlineButton)}
          </button>
          <button type="button"
                  className={`btn btn-${showEditOnline ? 'default' : 'primary'}`}
                  onClick={this.onTestTypeChange.bind(this, false)}
                  disabled={this.isLoading}
          >
            {this.props.intl.formatMessage(translations.uploadPackageButton)}
          </button>
        </div>
      </div>
    );
  }

  renderPackageField(field, label, pkg, showEditOnline) {
    const downloadNode = pkg ?
      <div>
        <strong>{this.props.intl.formatMessage(translations.downloadPackage)}: </strong>
        <a target="_blank" href={pkg.get('path')}>{pkg.get('name')}</a>
      </div>
      :
      null;

    if (showEditOnline) {
      return downloadNode;
    } else {
      return (
        <div className="form-group" key={field}>
          { this.renderLabel(label, false) }
          { downloadNode }
          <input className="form-control"
                 name={this.getInputName(field)}
                 id={this.getInputId(field)}
                 type="file"
                 disabled={this.isLoading}
          />
        </div>
      );
    }
  }

  render() {
    const { question, formData } = this.props.data;
    const languages = question.get('languages');
    const pkg = question.get('package');
    const showAttemptLimit = question.get('show_attempt_limit');

    const skillsOptions = question.get('skills').toArray().map(skill => {
      return { value: skill.get('id'), label: skill.get('title') };
    });
    const skillsValues = question.get('skill_ids').toArray();

    const languageOptions = languages.map(opt => {
      return <option value={opt.get('id')} key={opt.get('id')}>{opt.get('name')}</option>
    }).unshift(<option value={null} key="null" />);

    const showEditOnline = question.get('can_edit_online');

    return (
      <div>
        { this.props.importAlertView }
        <form id="programmming-question-form" action={formData.get('path')} method="post"
              onSubmit={this.onSubmit.bind(this)} ref={(form) => { this.form = form; }} >
          <input type='hidden' name='authenticity_token' value={formData.get('auth_token')} />

          { this.renderInputField('title', 'Title', false, 'text', question.get('title') || '') }
          { this.renderSummernoteField('description', 'Description', false, question.get('description') || '')}
          { this.renderSummernoteField('staff_only_comments', 'Staff only comments', false, question.get('staff_only_comments') || '')}
          { this.renderInputField('maximum_grade', 'Maximum Grade', true, 'number', this.convertNull(question.get('maximum_grade'))) }
          { this.renderMultiSelectField('skill_ids', 'Skills', skillsValues, skillsOptions, this.onSkillsChange) }
          { this.renderDropdownSelectField('language_id', 'Language', true, question.get('language_id') || undefined, languageOptions, this.onLanguageChange) }
          { this.renderInputField('memory_limit', 'Memory Limit', false, 'number', this.convertNull(question.get('memory_limit'))) }
          { this.renderInputField('time_limit', 'Time Limit', false, 'number', this.convertNull(question.get('time_limit'))) }
          { showAttemptLimit ?
            this.renderInputField('attempt_limit', 'Attempt Limit', false, 'number',
              this.convertNull(question.get('attempt_limit')),
              this.props.intl.formatMessage(translations.attemptLimitPlaceholderMessage))
            :
            null
          }

          { this.renderSwitcher(showEditOnline, question.get('can_switch_package_type')) }
          { this.renderPackageField('file', 'Template package', pkg, showEditOnline) }
          { this.props.testView }
          { this.props.buildLogView }

          <button className="btn btn-primary" type="submit" disabled={this.isLoading}>
            { this.isLoading ?
              (this.isEvaluating ? this.props.intl.formatMessage(translations.evaluatingMessage) : this.props.intl.formatMessage(translations.loadingMessage))
              :
              this.props.intl.formatMessage(translations.submitButton) }
            { this.isLoading ? <i className="fa fa-spinner fa-lg fa-spin" /> : null }
          </button>
        </form>
      </div>
    );
  }
}

ProgrammingQuestionForm.propTypes = propTypes;

export default injectIntl(ProgrammingQuestionForm);
