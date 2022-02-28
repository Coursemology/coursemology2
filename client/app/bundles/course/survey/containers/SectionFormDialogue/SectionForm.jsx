import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import renderTextField from 'lib/components/redux-form/TextField';
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
      label={intl.formatMessage(translations.title)}
      component={renderTextField}
      {...{ disabled }}
    />
    <br />
    <Field
      fullWidth
      name="description"
      label={intl.formatMessage(translations.description)}
      component={renderTextField}
      multiline
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
