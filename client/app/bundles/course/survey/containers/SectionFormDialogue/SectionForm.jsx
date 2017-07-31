import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import formTranslations from 'lib/translations/form';
import translations from 'course/survey/translations';
import { formNames } from 'course/survey/constants';

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  return errors;
};


const SectionForm = ({ handleSubmit, intl, onSubmit, disabled }) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <Field
      fullWidth
      name="title"
      floatingLabelText={intl.formatMessage(translations.title)}
      component={TextField}
      {...{ disabled }}
    />
    <br />
    <Field
      fullWidth
      name="description"
      floatingLabelText={intl.formatMessage(translations.description)}
      component={TextField}
      multiLine
      rows={2}
      {...{ disabled }}
    />
  </Form>
);

SectionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
};

export default reduxForm({
  form: formNames.SURVEY_SECTION,
  validate,
})(injectIntl(SectionForm));
