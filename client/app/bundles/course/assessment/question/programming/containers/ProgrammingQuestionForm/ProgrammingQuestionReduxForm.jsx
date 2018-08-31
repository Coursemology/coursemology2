import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, Form } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import TextField from 'lib/components/redux-form/TextField';
import Toggle from 'lib/components/redux-form/Toggle';
import RichTextField from 'lib/components/redux-form/RichTextField';
import SelectField from 'lib/components/redux-form/SelectField';
import MultiSelect, { optionShape } from 'lib/components/redux-form/MultiSelect';
import SingleFileInput from 'lib/components/redux-form/SingleFileInput';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import { Tabs, Tab } from 'material-ui/Tabs';

import OnlineEditor, { validation as editorValidation } from '../../components/OnlineEditor';
import UploadedPackageView from '../../components/UploadedPackageView';
import styles from './ProgrammingQuestionForm.scss';
import translations from './ProgrammingQuestionForm.intl';
import { formNames } from '../../constants';

class ProgrammingQuestionReduxForm extends React.Component {
  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  constructor(props) {
    super(props);

    this.state = {
      canEditPackage: props.canEditOnline,
    };
  }

  handlePackageTypeChange = (canEditPackage) => {
    this.setState({ canEditPackage });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(this.form);

    const failureMessage = this.props.intl.formatMessage(translations.submitFailureMessage);

    this.props.actions.submitForm(url, method, formData, failureMessage);
  }

  submitButtonText() {
    return this.props.intl.formatMessage(translations.submitButton);
  }

  renderAutogradedToggle() {
    const { autograded, autogradedAssessment, displayAutogradedToggle, hasAutoGradings } = this.props;

    if (!displayAutogradedToggle) {
      return null;
    }

    let autogradedLabel = this.props.intl.formatMessage(translations.autograded);
    if (autogradedAssessment && !autograded) {
      autogradedLabel += ` (${this.props.intl.formatMessage(translations.autogradedAssessment)})`;
    } else if (hasAutoGradings) {
      autogradedLabel += ` (${this.props.intl.formatMessage(translations.autogradedToggleDisabled)})`;
    }

    return (
      <Field
        name={ProgrammingQuestionReduxForm.getInputName('autograded')}
        component={Toggle}
        label={autogradedLabel}
        labelPosition="right"
        readOnly={hasAutoGradings}
        style={{ margin: '1em 0' }}
      />
    );
  }

  renderSwitcher() {
    const { canSwitchPackageType } = this.props;
    const { canEditPackage } = this.state;

    if (!canSwitchPackageType) {
      return null;
    }

    return (
      <Tabs
        value={canEditPackage}
        onChange={this.handlePackageTypeChange}
        style={{ margin: '1em 0' }}
      >
        <Tab
          id="test-case-editor-tab"
          label={this.props.intl.formatMessage(translations.editTestsOnlineButton)}
          value
        />
        <Tab
          id="upload-package-tab"
          label={this.props.intl.formatMessage(translations.uploadPackageButton)}
          value={false}
        />
      </Tabs>
    );
  }

  renderPackageLink() {
    const { packageFile, intl } = this.props;
    const { canEditPackage } = this.state;

    const fileLabelTranslation = canEditPackage ? translations.downloadPackageLabel : translations.uploadedPackageLabel;
    const userLabelTranslation = canEditPackage ? translations.packageUpdatedBy : translations.packageUploadedBy;

    let packageNode = null;
    if (packageFile) {
      packageNode = (
        <React.Fragment>
          <div>
            <span className={styles.uploadedPackageLabel}>
              {intl.formatMessage(fileLabelTranslation)}
:
            </span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={packageFile.path}
            >
              {packageFile.name}
            </a>
          </div>
          <div>
            {intl.formatMessage(userLabelTranslation, { name: packageFile.updater_name })}
          </div>
        </React.Fragment>
      );
    }

    return packageNode;
  }

  renderPackageEditor() {
    const { autograded, autogradedAssessment, hasSubmissions, languageId, isLoading } = this.props;

    return (
      <React.Fragment>
        {this.renderPackageLink()}
        <OnlineEditor
          {...{
            languageId,
            isLoading,
            autograded,
            autogradedAssessment,
            hasSubmissions,
          }}
        />
      </React.Fragment>
    );
  }

  renderPackageUploader() {
    const { intl, packageFile, programmingPackage } = this.props;

    return (
      <React.Fragment>
        <h3>{intl.formatMessage(translations.templatePackageFieldLabel)}</h3>
        {this.renderPackageLink()}
        <Field
          name={ProgrammingQuestionReduxForm.getInputName('package')}
          component={SingleFileInput}
          style={{ height: 100 }}
        />
        {packageFile && <UploadedPackageView programmingPackage={programmingPackage} />}
      </React.Fragment>
    );
  }

  renderAutogradedFields() {
    const { intl, autograded, autogradedAssessment } = this.props;
    const { canEditPackage } = this.state;

    if (!autograded) {
      return null;
    }

    return (
      <React.Fragment>
        <div style={{ display: 'flex' }}>
          <Field
            name={ProgrammingQuestionReduxForm.getInputName('memory_limit')}
            component={TextField}
            floatingLabelText={intl.formatMessage(translations.memoryLimitFieldLabel)}
            style={{ marginRight: '1em' }}
            fullWidth
          />
          <Field
            name={ProgrammingQuestionReduxForm.getInputName('time_limit')}
            component={TextField}
            floatingLabelText={intl.formatMessage(translations.timeLimitFieldLabel)}
            style={{ marginRight: '1em' }}
            fullWidth
          />
          {!autogradedAssessment && (
          <Field
            name={ProgrammingQuestionReduxForm.getInputName('attempt_limit')}
            component={TextField}
            floatingLabelText={intl.formatMessage(translations.attemptLimitFieldLabel)}
            fullWidth
          />
          )}
        </div>
        {this.renderSwitcher()}
        {canEditPackage ? this.renderPackageEditor() : this.renderPackageUploader()}
      </React.Fragment>
    );
  }

  render() {
    const { autograded, languages, skills, intl, isLoading } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <Field
          name={ProgrammingQuestionReduxForm.getInputName('title')}
          component={TextField}
          floatingLabelText={intl.formatMessage(translations.titleFieldLabel)}
          fullWidth
        />
        <Field
          name={ProgrammingQuestionReduxForm.getInputName('description')}
          component={RichTextField}
          label={intl.formatMessage(translations.descriptionFieldLabel)}
        />
        <Field
          name={ProgrammingQuestionReduxForm.getInputName('staff_only_comments')}
          component={RichTextField}
          label={intl.formatMessage(translations.staffOnlyCommentsFieldLabel)}
        />
        <Field
          name={ProgrammingQuestionReduxForm.getInputName('skill_ids')}
          component={MultiSelect}
          options={skills}
          label={intl.formatMessage(translations.skillsFieldLabel)}
        />
        <div style={{ display: 'flex' }}>
          <Field
            name={ProgrammingQuestionReduxForm.getInputName('maximum_grade')}
            component={TextField}
            floatingLabelText={`* ${intl.formatMessage(translations.maximumGradeFieldLabel)}`}
            style={{ width: '50%', marginRight: '1em' }}
          />
          <Field
            name={ProgrammingQuestionReduxForm.getInputName('language_id')}
            component={SelectField}
            floatingLabelText={`* ${intl.formatMessage(translations.languageFieldLabel)}`}
            style={{ width: '50%' }}
          >
            {languages.map(language => <MenuItem key={language.id} value={language.id} primaryText={language.name} />)}
          </Field>
        </div>
        {this.renderAutogradedToggle()}
        {autograded ? this.renderAutogradedFields() : this.renderPackageEditor()}

        <RaisedButton
          className={styles.submitButton}
          label={this.submitButtonText()}
          labelPosition="before"
          primary
          id="programmming-question-form-submit"
          type="submit"
          disabled={false}
          icon={isLoading ? <i className="fa fa-spinner fa-lg fa-spin" /> : null}
        />
      </form>
    );
  }
}

ProgrammingQuestionReduxForm.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.any).isRequired,
  skills: PropTypes.arrayOf(optionShape).isRequired,

  autograded: PropTypes.bool.isRequired,
  languageId: PropTypes.number.isRequired,

  autogradedAssessment: PropTypes.bool.isRequired,
  canEditOnline: PropTypes.bool.isRequired,
  canSwitchPackageType: PropTypes.bool.isRequired,
  displayAutogradedToggle: PropTypes.bool.isRequired,
  hasAutoGradings: PropTypes.bool.isRequired,
  hasSubmissions: PropTypes.bool.isRequired,

  packageFile: PropTypes.any,
  programmingPackage: PropTypes.any,
  import_result: PropTypes.any,
  intl: intlShape,
};

export default reduxForm({
  form: formNames.PROGRAMMING_QUESTION,
})(injectIntl(ProgrammingQuestionReduxForm));
