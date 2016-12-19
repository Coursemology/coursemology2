import React, { PropTypes } from 'react';
import ReactSummernote from 'react-summernote';
import Select from 'react-select';
import styles from './ProgrammingQuestionForm.scss'

import 'react-select/dist/react-select.css';

export default class ProgrammingQuestionForm extends React.Component {
  static propTypes = {
    data: React.PropTypes.shape({
      question: PropTypes.object.isRequired,
      formData: PropTypes.object.isRequired
    }),
    actions: React.PropTypes.shape({
      updateProgrammingQuestion: PropTypes.func.isRequired,
      updateSkills: PropTypes.func.isRequired,
      updateEditorMode: PropTypes.func.isRequired
    }),
  };

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
        />
        <ReactSummernote options={{ dialogsInBody: true }}
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
          >
            Edit Tests Online
          </button>
          <button type="button"
                  className={`btn btn-${showEditOnline ? 'default' : 'primary'}`}
                  onClick={this.onTestTypeChange.bind(this, false)}
          >
            Upload Package
          </button>
        </div>
      </div>
    );
  }

  renderPackageField(field, label, pkg, showEditOnline) {
    const downloadText = showEditOnline ? 'Download package' : 'Uploaded package';
    const downloadNode = pkg ?
      <div>
        <strong>{downloadText}: </strong>
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
    const testView = this.props.testView;

    const skillsOptions = question.get('skills').toArray().map(skill => {
      return { value: skill.get('id'), label: skill.get('title') };
    });
    const skillsValues = question.get('skill_ids').toArray();

    const languageOptions = languages.map(opt => {
      return <option value={opt.get('id')} key={opt.get('id')}>{opt.get('name')}</option>
    }).unshift(<option value={null} key="null" />);

    const showEditOnline = question.get('can_edit_online');

    const submitButtonText = formData.get('action') === 'edit' ? 'Update Programming' : 'Create Programming';

    return (
      <form id="programmming-question-form" encType="multipart/form-data" action={formData.get('path')} method="post">
        { formData.get('action') === 'edit' ? <input type="hidden" name="_method" value="patch" /> : null }
        <input type='hidden' name='authenticity_token' value={formData.get('auth_token')} />

        { this.renderInputField('title', 'Title', false, 'text', question.get('title') || '') }
        { this.renderSummernoteField('description', 'Description', false, question.get('description') || '')}
        { this.renderSummernoteField('staff_only_comments', 'Staff only comments', false, question.get('staff_only_comments') || '')}
        { this.renderInputField('maximum_grade', 'Maximum Grade', true, 'number', this.convertNull(question.get('maximum_grade'))) }
        { this.renderInputField('weight', 'Weight', true, 'number', this.convertNull(question.get('weight'))) }
        { this.renderMultiSelectField('skill_ids', 'Skills', skillsValues, skillsOptions, this.onSkillsChange) }
        { this.renderDropdownSelectField('language_id', 'Language', true, question.get('language_id') || undefined, languageOptions, this.onLanguageChange) }
        { this.renderInputField('memory_limit', 'Memory Limit', false, 'number', this.convertNull(question.get('memory_limit'))) }
        { this.renderInputField('time_limit', 'Time Limit', false, 'number', this.convertNull(question.get('time_limit'))) }
        { showAttemptLimit ?
          this.renderInputField('attempt_limit', 'Attempt Limit', false, 'number', this.convertNull(question.get('attempt_limit')),
            'The maximum times that the students can test their answers (does not apply to staff)') :
          null
        }

        { this.renderSwitcher(showEditOnline, question.get('can_switch_package_type')) }
        { this.renderPackageField('file', 'Template package', pkg, showEditOnline) }
        { testView }

        <input className="btn btn-primary" type="submit" value={submitButtonText} />
      </form>
    );
  }
}
