import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import Toggle from 'lib/components/redux-form/Toggle';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import formTranslations from 'lib/translations/form';
import translations from 'course/lesson-plan/translations';
import { formNames } from 'course/lesson-plan/constants';

const styles = {
  title: {
    width: '100%',
  },
  description: {
    width: '100%',
  },
  columns: {
    display: 'flex',
  },
  oneColumn: {
    flex: 1,
  },
  eventType: {
    flex: 1,
    marginRight: 10,
  },
  toggle: {
    marginTop: 16,
  },
};

const validationTranslations = defineMessages({
  startEndValidationError: {
    id: 'course.lessonPlan.EventForm.startEndValidationError',
    defaultMessage: 'Must be after "Start At"',
  },
});

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'start_at', 'event_type'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  if (values.end_at && values.start_at && new Date(values.start_at) >= new Date(values.end_at)) {
    errors.end_at = validationTranslations.startEndValidationError;
  }

  return errors;
};

const EventForm = ({ handleSubmit, onSubmit, disabled, formValues, shiftEndDate }) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <Field
      name="title"
      floatingLabelText={<FormattedMessage {...translations.title} />}
      component={TextField}
      style={styles.title}
      {...{ disabled }}
    />
    <div style={styles.columns}>
      <Field
        name="event_type"
        floatingLabelText={<FormattedMessage {...translations.eventType} />}
        component={TextField}
        style={styles.eventType}
        {...{ disabled }}
      />
      <Field
        name="location"
        floatingLabelText={<FormattedMessage {...translations.location} />}
        component={TextField}
        style={styles.oneColumn}
        {...{ disabled }}
      />
    </div>
    <Field
      name="description"
      floatingLabelText={<FormattedMessage {...translations.description} />}
      component={TextField}
      style={styles.description}
      multiLine
      rows={2}
      {...{ disabled }}
    />
    <div style={styles.columns}>
      <Field
        name="start_at"
        floatingLabelText={<FormattedMessage {...translations.startAt} />}
        component={DateTimePicker}
        afterChange={(_, newStartAt) => shiftEndDate(formNames.EVENT, newStartAt, formValues)}
        style={styles.oneColumn}
        {...{ disabled }}
      />
      <Field
        name="end_at"
        floatingLabelText={<FormattedMessage {...translations.endAt} />}
        component={DateTimePicker}
        style={styles.oneColumn}
        {...{ disabled }}
      />
    </div>
    <Field
      name="published"
      component={Toggle}
      parse={Boolean}
      label={<FormattedMessage {...translations.published} />}
      labelPosition="right"
      style={styles.toggle}
      disabled={disabled}
    />
  </Form>
);

EventForm.propTypes = {
  formValues: PropTypes.shape(),
  shiftEndDate: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default reduxForm({
  form: formNames.EVENT,
  validate,
})(EventForm);
