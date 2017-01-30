import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm, Field, FieldArray, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import SelectField from 'lib/components/redux-form/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'lib/components/redux-form/Toggle';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';
import formTranslations from 'lib/translations/form';
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
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  questionType: {
    width: '50%',
  },
  numberOfResponsesDiv: {
    display: 'flex',
  },
  numberOfResponsesField: {
    flex: 1,
  },
  numberOfResponsesInput: {
    width: '70%',
  },
  widget: {
    width: 'auto',
  },
  requiredToggle: {
    width: '35%',
    display: 'block',
  },
  // Overrides bootstrap's styling. To be removed once bootstrap is removed.
  requiredToggleLabel: {
    fontWeight: 'normal',
  },
  optionInput: {
    width: '75%',
  },
};

const questionFormTranslations = defineMessages({
  compulsory: {
    id: 'course.surveys.QuestionForm.compulsory',
    defaultMessage: 'Question is Compulsory',
  },
  addOption: {
    id: 'course.surveys.QuestionForm.addOption',
    defaultMessage: 'Add Option',
  },
  optionPlaceholder: {
    id: 'course.surveys.QuestionForm.optionPlaceholder',
    defaultMessage: 'Option {index}',
  },
  lessThanFilledOptions: {
    id: 'course.surveys.QuestionForm.lessThanFilledOptions',
    defaultMessage: 'Should be less than the number of filled options',
  },
  noMoreThanFilledOptions: {
    id: 'course.surveys.QuestionForm.noMoreThanFilledOptions',
    defaultMessage: 'Should not be more than the number of filled options',
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
});

const validate = (values) => {
  const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
  const errors = {};

  const requiredFields = ['question_type', 'description'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  const filledOptions = values.options.filter(option => option && option.option).length;
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
  constructor(props) {
    super(props);
    this.renderMcqOptions = this.renderMcqOptions.bind(this);
    this.renderMrqOptions = this.renderMrqOptions.bind(this);
    this.renderSpecificFields = this.renderSpecificFields.bind(this);
  }

  renderOptions(Widget) {
    const { intl } = this.props;
    return ({ fields, disabled }) => (
      <div>
        {fields.map((member, index) =>
          <div key={index} style={styles.option}>
            <Widget disabled style={styles.widget} />
            <Field
              name={`${member}.option`}
              placeholder={intl.formatMessage(
                questionFormTranslations.optionPlaceholder,
                { index: index + 1 }
              )}
              component={TextField}
              style={styles.optionInput}
              {...{ disabled }}
            />
            <IconButton onTouchTap={() => fields.remove(index)} {...{ disabled }}>
              <CloseIcon />
            </IconButton>
          </div>
        )}
        <FlatButton
          primary
          label={intl.formatMessage(questionFormTranslations.addOption)}
          onTouchTap={() => fields.push({})}
          {...{ disabled }}
        />
      </div>
    );
  }

  renderMrqOptions(props) {
    return this.renderOptions(Checkbox)(props);
  }

  renderMcqOptions(props) {
    return this.renderOptions(RadioButton)(props);
  }

  renderNumberOfResponsesField(name, floatingLabelText) {
    const { disabled } = this.props;
    return (
      <Field
        component={TextField}
        type="number"
        style={styles.numberOfResponsesField}
        inputStyle={styles.numberOfResponsesInput}
        underlineStyle={styles.numberOfResponsesInput}
        {...{ name, floatingLabelText, disabled }}
      />
    );
  }

  renderSpecificFields(questionType) {
    const { intl, disabled } = this.props;
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;

    let specificFields;
    switch (questionType) {
      case MULTIPLE_CHOICE:
        specificFields = (
          <FieldArray name="options" component={this.renderMcqOptions} {...{ disabled }} />
        );
        break;
      case MULTIPLE_RESPONSE:
        specificFields = (
          <div>
            <div style={styles.numberOfResponsesDiv}>
              {this.renderNumberOfResponsesField(
                'min_options',
                intl.formatMessage(translations.minOptions)
              )}
              {this.renderNumberOfResponsesField(
                'max_options',
                intl.formatMessage(translations.maxOptions)
              )}
            </div>
            <FieldArray name="options" component={this.renderMrqOptions} {...{ disabled }} />
          </div>
        );
        break;
      case TEXT:
      default:
        specificFields = [];
    }
    return specificFields;
  }

  render() {
    const { handleSubmit, intl, onSubmit, disabled, formValues } = this.props;
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const questionType = formValues && formValues.question_type;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
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
        {this.renderSpecificFields(questionType)}
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
