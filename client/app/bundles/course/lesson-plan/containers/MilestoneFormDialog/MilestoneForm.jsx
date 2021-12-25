import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Field, Form, reduxForm } from 'redux-form';

import { fields, formNames } from 'course/lesson-plan/constants';
import translations from 'course/lesson-plan/translations';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import RichTextField from 'lib/components/redux-form/RichTextField';
import TextField from 'lib/components/redux-form/TextField';
import formTranslations from 'lib/translations/form';

const { TITLE, DESCRIPTION, START_AT } = fields;

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
      component={TextField}
      floatingLabelText={<FormattedMessage {...translations[TITLE]} />}
      fullWidth={true}
      name="title"
      {...{ disabled }}
    />
    <br />
    <Field
      component={RichTextField}
      fullWidth={true}
      label={<FormattedMessage {...translations[DESCRIPTION]} />}
      multiLine={true}
      name="description"
      rows={2}
      {...{ disabled }}
    />
    <Field
      component={DateTimePicker}
      floatingLabelText={<FormattedMessage {...translations[START_AT]} />}
      name="start_at"
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
