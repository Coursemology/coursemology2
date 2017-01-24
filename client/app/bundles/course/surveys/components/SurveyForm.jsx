import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import formTranslations from 'lib/translations/form';

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

const translations = defineMessages({
  title: {
    id: 'course.surveys.SurveyForm.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.surveys.SurveyForm.description',
    defaultMessage: 'Description',
  },
  baseExp: {
    id: 'course.surveys.SurveyForm.baseExp',
    defaultMessage: 'Experience Points Awarded',
  },
  startAt: {
    id: 'course.surveys.SurveyForm.startAt',
    defaultMessage: 'Start At',
  },
  endAt: {
    id: 'course.surveys.SurveyForm.endAt',
    defaultMessage: 'End At',
  },
  startEndValidationError: {
    id: 'course.surveys.SurveyForm.startEndValidationError',
    defaultMessage: "Must be after 'Start At'",
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
    errors.end_at = translations.startEndValidationError;
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
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
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
        floatingLabelText={intl.formatMessage(translations.startAt)}
        component={DateTimePicker}
        afterChange={(_, newStartAt) => shiftEndDate('survey', newStartAt, formValues)}
        style={styles.dateTimeInput}
        {...{ disabled }}
      />
      <Field
        name="end_at"
        floatingLabelText={intl.formatMessage(translations.endAt)}
        component={DateTimePicker}
        style={styles.dateTimeInput}
        {...{ disabled }}
      />
    </div>
    <Field
      name="base_exp"
      floatingLabelText={intl.formatMessage(translations.baseExp)}
      component={TextField}
      type="number"
      {...{ disabled }}
    />
  </Form>
);

SurveyForm.propTypes = propTypes;

export default reduxForm({
  form: 'survey',
  validate,
})(injectIntl(SurveyForm));
