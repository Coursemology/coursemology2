import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Field, Form, reduxForm } from 'redux-form';

import { formNames } from 'course/duplication/constants';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import TextField from 'lib/components/redux-form/TextField';
import formTranslations from 'lib/translations/form';

const translations = defineMessages({
  newTitle: {
    id: 'course.duplication.NewCourseForm.newTitle',
    defaultMessage: 'New Title',
  },
  newStartAt: {
    id: 'course.duplication.NewCourseForm.newStartAt',
    defaultMessage: 'New Start Date',
  },
});

const validate = (values) => {
  const errors = {};

  const requiredFields = ['new_title', 'new_start_at'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  return errors;
};

const NewCourseForm = (props) => {
  const { handleSubmit, intl, onSubmit, disabled } = props;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Field
        component={TextField}
        floatingLabelText={intl.formatMessage(translations.newTitle)}
        fullWidth={true}
        name="new_title"
        {...{ disabled }}
      />
      <Field
        component={DateTimePicker}
        floatingLabelText={intl.formatMessage(translations.newStartAt)}
        name="new_start_at"
        {...{ disabled }}
      />
    </Form>
  );
};

NewCourseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,

  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape,
};

export default reduxForm({
  form: formNames.NEW_COURSE,
  validate,
})(injectIntl(NewCourseForm));
