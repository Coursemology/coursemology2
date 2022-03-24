import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import renderTextField from 'lib/components/redux-form/TextField';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import formTranslations from 'lib/translations/form';
import { formNames } from 'course/duplication/constants';

const translations = defineMessages({
  newStartAt: {
    id: 'course.duplication.NewCourseForm.newStartAt',
    defaultMessage: 'New Start Date',
  },
  newTitle: {
    id: 'course.duplication.NewCourseForm.newTitle',
    defaultMessage: 'New Title',
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
        fullWidth
        name="new_title"
        label={intl.formatMessage(translations.newTitle)}
        component={renderTextField}
        {...{ disabled }}
      />
      <Field
        name="new_start_at"
        label={intl.formatMessage(translations.newStartAt)}
        component={DateTimePicker}
        {...{ disabled }}
      />
    </Form>
  );
};

NewCourseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,

  handleSubmit: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default reduxForm({
  form: formNames.NEW_COURSE,
  validate,
})(injectIntl(NewCourseForm));
