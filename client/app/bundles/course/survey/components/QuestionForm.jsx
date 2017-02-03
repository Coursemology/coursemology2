import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm, Field, FieldArray, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import SelectField from 'lib/components/redux-form/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'lib/components/redux-form/Toggle';
import DisplayTextField from 'material-ui/TextField';
import formTranslations from 'lib/translations/form';
import QuestionFormOptions from './QuestionFormOptions';
import translations from '../translations';
import { questionTypes, formNames } from '../constants';

const styles = {
  description: {
    width: '100%',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  questionType: {
    width: '50%',
  },
  numberOfResponsesDiv: {
    display: 'flex',
  },
  numberOfResponsesField: {
    style: { flex: 1 },
    inputStyle: { width: '80%' },
    underlineStyle: { width: '80%' },
  },
  requiredToggle: {
    width: '35%',
    display: 'block',
  },
  // Overrides bootstrap's styling. To be removed once bootstrap is removed.
  requiredToggleLabel: {
    fontWeight: 'normal',
  },
};

const questionFormTranslations = defineMessages({
  compulsory: {
    id: 'course.surveys.QuestionForm.compulsory',
    defaultMessage: 'Question is Compulsory',
  },
  lessThanFilledOptions: {
    id: 'course.surveys.QuestionForm.lessThanFilledOptions',
    defaultMessage: 'Should be less than the valid option count',
  },
  noMoreThanFilledOptions: {
    id: 'course.surveys.QuestionForm.noMoreThanFilledOptions',
    defaultMessage: 'Should not be more than the valid option count',
  },
  atLeastOne: {
    id: 'course.surveys.QuestionForm.atLeastOne',
    defaultMessage: 'Should be at least 1',
  },
  atLeastZero: {
    id: 'course.surveys.QuestionForm.atLeastZero',
    defaultMessage: 'Should be at least 0',
  },
  notLessThanMin: {
    id: 'course.surveys.QuestionForm.notLessThanMin',
    defaultMessage: 'Should not be less than minimum',
  },
  noRestriction: {
    id: 'course.surveys.QuestionForm.noRestriction',
    defaultMessage: 'No Restriction',
  },
  optionCount: {
    id: 'course.surveys.QuestionForm.optionCount',
    defaultMessage: 'Valid Option Count',
  },
});

const countFilledOptions = options => (
  options.filter(option => option && (option.option || option.image)).length
);

const validate = (values) => {
  const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
  const errors = {};

  const requiredFields = ['question_type', 'description'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  const filledOptions = countFilledOptions(values.options);
  if ((values.question_type === MULTIPLE_CHOICE || values.question_type === MULTIPLE_RESPONSE)
      && filledOptions < 1) {
    errors.options = [{ option: formTranslations.required }];
  }

  if (values.question_type === MULTIPLE_RESPONSE && values.min_options) {
    if (values.min_options >= filledOptions) {
      errors.min_options = questionFormTranslations.lessThanFilledOptions;
    } else if (values.min_options < 0) {
      errors.min_options = questionFormTranslations.atLeastZero;
    }
  }

  if (values.question_type === MULTIPLE_RESPONSE && values.max_options) {
    if (values.max_options < 1) {
      errors.max_options = questionFormTranslations.atLeastOne;
    } else if (values.max_options > filledOptions) {
      errors.max_options = questionFormTranslations.noMoreThanFilledOptions;
    } else if (values.min_options && values.min_options > values.max_options) {
      errors.max_options = questionFormTranslations.notLessThanMin;
    }
  }

  return errors;
};

class QuestionForm extends React.Component {
  renderNumberOfResponsesField(name, floatingLabelText) {
    const { intl, disabled } = this.props;
    return (
      <Field
        component={TextField}
        type="number"
        {...styles.numberOfResponsesField}
        placeholder={intl.formatMessage(questionFormTranslations.noRestriction)}
        {...{ name, floatingLabelText, disabled }}
      />
    );
  }

  renderValidOptionCount(formValues) {
    const { intl } = this.props;
    const numberOfFilledOptions = formValues ? countFilledOptions(formValues.options) : 0;

    return (
      <DisplayTextField
        disabled
        name="filled_options"
        value={numberOfFilledOptions}
        {...styles.numberOfResponsesField}
        floatingLabelText={intl.formatMessage(questionFormTranslations.optionCount)}
      />
    );
  }

  renderMultipleChoiceFields() {
    const { disabled, formValues } = this.props;
    return (
      <div>
        { this.renderValidOptionCount(formValues) }
        <FieldArray
          name="options"
          multipleChoice
          component={QuestionFormOptions}
          {...{ disabled }}
        />
      </div>
    );
  }

  renderMultipleResponseFields() {
    const { intl, disabled, formValues } = this.props;
    return (
      <div>
        <div style={styles.numberOfResponsesDiv}>
          {this.renderValidOptionCount(formValues)}
          {this.renderNumberOfResponsesField(
            'min_options',
            intl.formatMessage(translations.minOptions)
          )}
          {this.renderNumberOfResponsesField(
            'max_options',
            intl.formatMessage(translations.maxOptions)
          )}
        </div>
        <FieldArray
          name="options"
          multipleResponse
          component={QuestionFormOptions}
          {...{ disabled }}
        />
      </div>
    );
  }

  renderSpecificFields(questionType) {
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const renderer = {
      [MULTIPLE_CHOICE]: this.renderMultipleChoiceFields,
      [MULTIPLE_RESPONSE]: this.renderMultipleResponseFields,
    }[questionType];

    return renderer ? renderer.call(this) : null;
  }

  render() {
    const { handleSubmit, intl, onSubmit, disabled, formValues } = this.props;
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const questionType = formValues && formValues.question_type;

    return (
      <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <div style={styles.fieldRow}>
          <Field
            name="question_type"
            floatingLabelText={intl.formatMessage(translations.questionType)}
            component={SelectField}
            style={styles.questionType}
            {...{ disabled }}
          >
            <MenuItem
              value={TEXT}
              primaryText={intl.formatMessage(translations.textResponse)}
            />
            <MenuItem
              value={MULTIPLE_CHOICE}
              primaryText={intl.formatMessage(translations.multipleChoice)}
            />
            <MenuItem
              value={MULTIPLE_RESPONSE}
              primaryText={intl.formatMessage(translations.multipleResponse)}
            />
          </Field>
          <Field
            name="required"
            label={intl.formatMessage(questionFormTranslations.compulsory)}
            component={Toggle}
            style={styles.requiredToggle}
            labelStyle={styles.requiredToggleLabel}
            {...{ disabled }}
          />
        </div>
        <Field
          name="description"
          floatingLabelText={intl.formatMessage(translations.questionText)}
          component={TextField}
          style={styles.description}
          multiLine
          rows={2}
          {...{ disabled }}
        />
        { this.renderSpecificFields(questionType) }
      </Form>
    );
  }
}

QuestionForm.propTypes = {
  formValues: PropTypes.shape({
    quesion_type: PropTypes.string,
  }),
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
};

export default reduxForm({
  form: formNames.SURVEY_QUESTION,
  validate,
})(injectIntl(QuestionForm));
