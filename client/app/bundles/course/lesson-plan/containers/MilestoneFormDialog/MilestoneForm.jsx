import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import formTranslations from 'lib/translations/form';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import translations from 'course/lesson-plan/translations';
import { formNames } from 'course/lesson-plan/constants';

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'start_at'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  return errors;
};

const MilestoneForm = ({ handleSubmit, onSubmit, disabled }) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <Field
      fullWidth
      name="title"
      floatingLabelText={<FormattedMessage {...translations.title} />}
      component={TextField}
      {...{ disabled }}
    />
    <br />
    <Field
      fullWidth
      name="description"
      floatingLabelText={<FormattedMessage {...translations.description} />}
      component={TextField}
      multiLine
      rows={2}
      {...{ disabled }}
    />
    <Field
      name="start_at"
      floatingLabelText={<FormattedMessage {...translations.startAt} />}
      component={DateTimePicker}
      {...{ disabled }}
    />
  </Form>
);


MilestoneForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default reduxForm({
  form: formNames.MILESTONE,
  validate,
})(MilestoneForm);
