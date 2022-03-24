import { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm, Field, FieldArray, Form } from 'redux-form';
import renderTextField from 'lib/components/redux-form/TextField';
import renderSelectField from 'lib/components/redux-form/SelectField';
import renderToggleField from 'lib/components/redux-form/Toggle';
import { ListSubheader, MenuItem, TextField } from '@mui/material';
import formTranslations from 'lib/translations/form';
import translations from 'course/survey/translations';
import { questionTypes, formNames } from 'course/survey/constants';
import QuestionFormOptions from './QuestionFormOptions';
import QuestionFormDeletedOptions from './QuestionFormDeletedOptions';

const styles = {
  questionType: {
    width: '50%',
  },
  numberOfResponsesDiv: {
    display: 'flex',
  },
  numberOfResponsesField: {
    style: { flex: 1 },
  },
  toggle: {
    marginTop: 10,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
};

const questionFormTranslations = defineMessages({
  atLeastOne: {
    id: 'course.surveys.QuestionForm.atLeastOne',
    defaultMessage: 'Should be at least 1',
  },
  atLeastZero: {
    id: 'course.surveys.QuestionForm.atLeastZero',
    defaultMessage: 'Should be at least 0',
  },
  gridView: {
    id: 'course.surveys.QuestionForm.gridView',
    defaultMessage: 'Grid View',
  },
  gridViewHint: {
    id: 'course.surveys.QuestionForm.gridViewHint',
    defaultMessage:
      'When selected, question options will be display as grid instead of a list. \
      This option is meant for questions with images as options.',
  },
  lessThanFilledOptions: {
    id: 'course.surveys.QuestionForm.lessThanFilledOptions',
    defaultMessage: 'Should be less than the valid option count',
  },
  noMoreThanFilledOptions: {
    id: 'course.surveys.QuestionForm.noMoreThanFilledOptions',
    defaultMessage: 'Should not be more than the valid option count',
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
  optionsToDelete: {
    id: 'course.surveys.QuestionForm.optionsToDelete',
    defaultMessage: 'Options To Delete',
  },
  optionsToKeep: {
    id: 'course.surveys.QuestionForm.optionsToKeep',
    defaultMessage: 'Options To Keep',
  },
  required: {
    id: 'course.surveys.QuestionForm.required',
    defaultMessage: 'Required',
  },
  requiredHint: {
    id: 'course.surveys.QuestionForm.requiredHint',
    defaultMessage:
      'When selected, student must answer this question in order to complete the survey.',
  },
});

const countFilledOptions = (options) =>
  options.filter(
    (option) => option && (option.option || option.file || option.image_url),
  ).length;

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
  if (
    (values.question_type === MULTIPLE_CHOICE ||
      values.question_type === MULTIPLE_RESPONSE) &&
    filledOptions < 1
  ) {
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

class QuestionForm extends Component {
  renderMultipleChoiceFields() {
    return (
      <div>
        {this.renderTiledViewToggle()}
        {this.renderValidOptionCount()}
        {this.renderOptionFields({ multipleChoice: true })}
      </div>
    );
  }

  renderMultipleResponseFields() {
    const { intl } = this.props;
    return (
      <div>
        {this.renderTiledViewToggle()}
        <div style={styles.numberOfResponsesDiv}>
          {this.renderValidOptionCount()}
          {this.renderNumberOfResponsesField(
            'min_options',
            intl.formatMessage(translations.minOptions),
          )}
          {this.renderNumberOfResponsesField(
            'max_options',
            intl.formatMessage(translations.maxOptions),
          )}
        </div>
        {this.renderOptionFields({ multipleResponse: true })}
      </div>
    );
  }

  renderNumberOfResponsesField(name, label) {
    const { disabled } = this.props;
    return (
      <Field
        component={renderTextField}
        type="number"
        {...styles.numberOfResponsesField}
        placeholder={questionFormTranslations.noRestriction.defaultMessage}
        {...{ name, label, disabled }}
      />
    );
  }

  renderOptionFields(props) {
    const { disabled, addToOptionsToDelete } = this.props;

    return (
      <div>
        {this.renderOptionsToDelete(props)}
        <FieldArray
          name="options"
          component={QuestionFormOptions}
          {...{ disabled, addToOptionsToDelete }}
          {...props}
        />
      </div>
    );
  }

  renderOptionsToDelete(props) {
    const { intl, disabled, formValues, addToOptions } = this.props;
    if (
      formValues &&
      // eslint-disable-next-line react/prop-types
      formValues.optionsToDelete &&
      // eslint-disable-next-line react/prop-types
      formValues.optionsToDelete.length > 0
    ) {
      return (
        <div>
          <ListSubheader disableSticky>
            {intl.formatMessage(questionFormTranslations.optionsToDelete)}
          </ListSubheader>
          <FieldArray
            name="optionsToDelete"
            component={QuestionFormDeletedOptions}
            {...{ disabled, addToOptions }}
            {...props}
          />
          <ListSubheader disableSticky>
            {intl.formatMessage(questionFormTranslations.optionsToKeep)}
          </ListSubheader>
        </div>
      );
    }
    return null;
  }

  renderSpecificFields(questionType) {
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const renderer = {
      [MULTIPLE_CHOICE]: this.renderMultipleChoiceFields,
      [MULTIPLE_RESPONSE]: this.renderMultipleResponseFields,
    }[questionType];

    return renderer ? renderer.call(this) : null;
  }

  renderTiledViewToggle() {
    const { intl, disabled } = this.props;
    return (
      <>
        <Field
          name="grid_view"
          label={intl.formatMessage(questionFormTranslations.gridView)}
          component={renderToggleField}
          parse={Boolean}
          style={styles.toggle}
          {...{ disabled }}
        />
        <p style={styles.hint}>
          {intl.formatMessage(questionFormTranslations.gridViewHint)}
        </p>
      </>
    );
  }

  renderValidOptionCount() {
    const { intl, formValues } = this.props;
    const numberOfFilledOptions = formValues
      ? // eslint-disable-next-line react/prop-types
        countFilledOptions(formValues.options)
      : 0;

    return (
      <TextField
        disabled
        name="filled_options"
        value={numberOfFilledOptions}
        label={intl.formatMessage(questionFormTranslations.optionCount)}
        fullWidth
        style={{ marginBottom: 12, marginTop: 14, marginRight: 16 }}
        variant="standard"
      />
    );
  }

  render() {
    const { handleSubmit, intl, onSubmit, disabled, formValues } = this.props;
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const questionType = formValues && formValues.question_type;

    return (
      <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Field
          name="question_type"
          label={intl.formatMessage(translations.questionType)}
          component={renderSelectField}
          style={styles.questionType}
          {...{ disabled }}
        >
          <MenuItem value={TEXT}>
            {intl.formatMessage(translations.textResponse)}
          </MenuItem>
          <MenuItem value={MULTIPLE_CHOICE}>
            {intl.formatMessage(translations.multipleChoice)}
          </MenuItem>
          <MenuItem value={MULTIPLE_RESPONSE}>
            {intl.formatMessage(translations.multipleResponse)}
          </MenuItem>
        </Field>
        <Field
          fullWidth
          name="description"
          label={intl.formatMessage(translations.questionText)}
          component={renderTextField}
          multiline
          minRows={4}
          {...{ disabled }}
        />
        <Field
          name="required"
          label={intl.formatMessage(questionFormTranslations.required)}
          component={renderToggleField}
          parse={Boolean}
          style={styles.toggle}
          {...{ disabled }}
        />
        <p style={styles.hint}>
          {intl.formatMessage(questionFormTranslations.requiredHint)}
        </p>
        {this.renderSpecificFields(questionType)}
      </Form>
    );
  }
}

QuestionForm.propTypes = {
  formValues: PropTypes.shape({
    question_type: PropTypes.string,
  }),
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  addToOptions: PropTypes.func.isRequired,
  addToOptionsToDelete: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

export default reduxForm({
  form: formNames.SURVEY_QUESTION,
  validate,
})(injectIntl(QuestionForm));
