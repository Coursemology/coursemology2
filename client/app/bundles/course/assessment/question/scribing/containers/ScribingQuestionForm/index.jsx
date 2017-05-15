import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import MaterialSummernote from 'lib/components/MaterialSummernote';
import ChipInput from 'lib/components/ChipInput';

import styles from './ScribingQuestionForm.scss';
import translations from './ScribingQuestionForm.intl';

import { fetchScribingQuestion, createScribingQuestion, updateScribingQuestion } from '../../actions/scribingQuestionActionCreators';
import { formNames } from '../../constants';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.shape({
    question: PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
      description: PropTypes.string,
      staff_only_comments: PropTypes.string,
      maximum_grade: PropTypes.number,
      weight: PropTypes.number,
      skill_ids: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
      })),
      skills: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
      })),
      error: PropTypes.shape({
        title: PropTypes.string,
        skills_id: PropTypes.string,
        maximum_grade: PropTypes.number,
      }),
      published_assessment: PropTypes.bool,
      attempt_limit: PropTypes.number,
    }),
    is_loading: PropTypes.bool,
  }).isRequired,
  scribingId: PropTypes.string,
  intl: intlShape.isRequired,
  // Redux-form proptypes
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

class ScribingQuestionForm extends React.Component {
  static getInputName(field) {
    return `question_scribing.${field}`;
  }

  static getInputId(field) {
    return `question_scribing_${field}`;
  }

  static convertNull(value) {
    return value === null ? '' : value;
  }

  componentDidMount() {
    const { dispatch, scribingId } = this.props;
    if (scribingId) {
      dispatch(fetchScribingQuestion(scribingId));
    }
    this.summernoteEditors = $('#scribing-question-form .note-editor .note-editable');
  }

  componentWillReceiveProps(nextProps) {
    this.summernoteEditors.attr('contenteditable', !nextProps.data.is_loading);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.data.is_loading !== nextProps.data.is_loading;
  }

  handleCreateQuestion = (data) => {
    const { dispatch } = this.props;
    return dispatch(
      createScribingQuestion(data)
    );
  }

  handleUpdateQuestion = (data) => {
    const { dispatch, scribingId } = this.props;
    return dispatch(
      updateScribingQuestion(scribingId, data)
    );
  }

  submitButtonText() {
    if (this.props.data.is_loading) {
      return this.props.intl.formatMessage(translations.loadingMessage);
    }

    return this.props.intl.formatMessage(translations.submitButton);
  }

  renderInputField(label, field, required, validate,
    type, value, placeholder = null) {
    return (
      <div title={placeholder}>
        <Field
          name={ScribingQuestionForm.getInputName(field)}
          id={ScribingQuestionForm.getInputId(field)}
          validate={validate}
          floatingLabelText={(required ? '* ' : '') + label}
          floatingLabelFixed
          fullWidth
          type={type}
          component={TextField}
          disabled={this.props.data.is_loading}
        />
      </div>
    );
  }

  renderSummernoteField(label, field, validate, value) {
    return (
      <Field
        name={ScribingQuestionForm.getInputName(field)}
        id={ScribingQuestionForm.getInputId(field)}
        validate={validate}
        component={props => (
          <MaterialSummernote
            field={field}
            label={label}
            value={value}
            disabled={this.props.data.is_loading}
            name={ScribingQuestionForm.getInputName(field)}
            inputId={ScribingQuestionForm.getInputId(field)}
            onChange={props.input.onChange}
          />
          )}
      />
    );
  }

  renderMultiSelectSkillsField(label, field, value, options, error) {
    return (
      <div key={field}>
        <Field
          name={ScribingQuestionForm.getInputName(field)}
          id={ScribingQuestionForm.getInputId(field)}
          component={props => (
            <ChipInput
              id={ScribingQuestionForm.getInputId(field)}
              value={props.input.value || []}
              dataSource={options}
              dataSourceConfig={{ value: 'id', text: 'title' }}
              onRequestAdd={(addedChip) => {
                let values = props.input.value || [];
                values = values.slice();
                values.push(addedChip);
                props.input.onChange(values);
              }}
              onRequestDelete={(deletedChip) => {
                let values = props.input.value || [];
                values = values.filter(v => v.id !== deletedChip);
                props.input.onChange(values);
              }}
              floatingLabelText={label}
              floatingLabelFixed
              openOnFocus
              fullWidth
              disabled={this.props.data.is_loading}
              errorText={error}
              menuStyle={{ maxHeight: '80vh', overflowY: 'scroll' }}
            />
            )}
        />

        <select
          name={`${ScribingQuestionForm.getInputName(field)}[]`}
          multiple
          value={value.map(opt => opt.id)}
          style={{ display: 'none' }}
          disabled={this.props.data.is_loading}
          onChange={(e) => { this.onSelectSkills(parseInt(e.target.value, 10) || e.target.value); }}
        >
          { options.map(opt => <option value={opt.id} key={opt.id}>{opt.title}</option>) }
        </select>
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

    // TODO: Display submit fail response
    // TODO: Display submitting message
    return (
      <div>
        <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className={styles.inputContainer}>
            <div className={styles.titleInput}>
              {
                this.renderInputField(
                  this.props.intl.formatMessage(translations.titleFieldLabel),
                  'title', false, [], 'text', question.title || '',
                  this.props.data.question.error && this.props.data.question.error.title)
              }
            </div>
            <div className={styles.descriptionInput}>
              {
                this.renderSummernoteField(
                  this.props.intl.formatMessage(translations.descriptionFieldLabel),
                  'description', [], question.description || '')
              }
            </div>
            <div className={styles.staffCommentsInput}>
              {
                this.renderSummernoteField(
                  this.props.intl.formatMessage(translations.staffOnlyCommentsFieldLabel),
                  'staff_only_comments', [], question.staff_only_comments || '')
             }
            </div>
            <div className={styles.skillsInput}>
              {
                this.renderMultiSelectSkillsField(
                  this.props.intl.formatMessage(translations.skillsFieldLabel),
                  'skill_ids', skillsValues, skillsOptions)
              }
            </div>
            <div className={styles.maximumGradeInput}>
              {
                this.renderInputField(
                  this.props.intl.formatMessage(translations.maximumGradeFieldLabel),
                  'maximum_grade', true, [required, lessThan1000, nonNegative], 'number',
                  ScribingQuestionForm.convertNull(question.maximum_grade))
              }
            </div>
            <div className={styles.attemptLimitInput}>
              {
                  this.renderInputField(
                    this.props.intl.formatMessage(translations.attemptLimitFieldLabel),
                    'attempt_limit', false, [nonNegative], 'number',
                    ScribingQuestionForm.convertNull(question.attempt_limit),
                    this.props.intl.formatMessage(translations.attemptLimitPlaceholderMessage))
                }
            </div>
          </div>

          <RaisedButton
            className={styles.submitButton}
            label={'Submit'}
            labelPosition="before"
            primary
            id="scribing-question-form-submit"
            type="submit"
            disabled={this.props.data.is_loading || submitting}
            icon={this.props.data.is_loading ? <i className="fa fa-spinner fa-lg fa-spin" /> : null}
          />
        </Form>
      </div>
    );
  }
}

ScribingQuestionForm.propTypes = propTypes;

export default reduxForm({
  form: formNames.SCRIBING_QUESTION,
  enableReinitialize: true,
})(injectIntl(ScribingQuestionForm));

