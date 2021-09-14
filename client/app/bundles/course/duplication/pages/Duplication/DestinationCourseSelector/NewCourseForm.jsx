import { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import formTranslations from 'lib/translations/form';
import { formNames } from 'course/duplication/constants';

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

class NewCourseForm extends Component {
  render() {
    const { handleSubmit, intl, onSubmit, disabled } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Field
          fullWidth
          name="new_title"
          floatingLabelText={intl.formatMessage(translations.newTitle)}
          component={TextField}
          {...{ disabled }}
        />
        <Field
          name="new_start_at"
          floatingLabelText={intl.formatMessage(translations.newStartAt)}
          component={DateTimePicker}
          {...{ disabled }}
        />
      </Form>
    );
  }
}

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
