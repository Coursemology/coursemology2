import React, { PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import formTranslations from 'lib/translations/form';
import translations from 'course/survey/translations';
import { formNames } from 'course/survey/constants';

const styles = {
  title: {
    width: '100%',
  },
  description: {
    width: '100%',
  },
  dateTimeDiv: {
    display: 'flex',
  },
  dateTimeInput: {
    flex: 1,
  },
};

const surveyFormTranslations = defineMessages({
  startEndValidationError: {
    id: 'course.surveys.SurveyForm.startEndValidationError',
    defaultMessage: "Must be after 'Opens At'",
  },
});

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'start_at'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  if (values.end_at && new Date(values.start_at) >= new Date(values.end_at)) {
    errors.end_at = surveyFormTranslations.startEndValidationError;
  }

  return errors;
};

const propTypes = {
  formValues: PropTypes.shape({
    start_at: PropTypes.instanceOf(Date),
    end_at: PropTypes.instanceOf(Date),
  }),
  shiftEndDate: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
};

const SurveyForm = ({ handleSubmit, intl, onSubmit, disabled, shiftEndDate, formValues }) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <Field
      name="title"
      floatingLabelText={intl.formatMessage(translations.title)}
      component={TextField}
      style={styles.title}
      {...{ disabled }}
    />
    <br />
    <Field
      name="description"
      floatingLabelText={intl.formatMessage(translations.description)}
      component={TextField}
      style={styles.description}
      multiLine
      rows={2}
      {...{ disabled }}
    />
    <div style={styles.dateTimeDiv}>
      <Field
        name="start_at"
        floatingLabelText={intl.formatMessage(translations.opensAt)}
        component={DateTimePicker}
        afterChange={(_, newStartAt) => shiftEndDate(formNames.SURVEY, newStartAt, formValues)}
        style={styles.dateTimeInput}
        {...{ disabled }}
      />
      <Field
        name="end_at"
        floatingLabelText={intl.formatMessage(translations.expiresAt)}
        component={DateTimePicker}
        style={styles.dateTimeInput}
        {...{ disabled }}
      />
    </div>
    <Field
      name="base_exp"
      floatingLabelText={intl.formatMessage(translations.points)}
      component={TextField}
      type="number"
      {...{ disabled }}
    />
  </Form>
);

SurveyForm.propTypes = propTypes;

export default reduxForm({
  form: formNames.SURVEY,
  validate,
})(injectIntl(SurveyForm));
