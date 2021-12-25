import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Field, Form, reduxForm } from 'redux-form';

import { formNames } from 'course/survey/constants';
import translations from 'course/survey/translations';
import TextField from 'lib/components/redux-form/TextField';
import formTranslations from 'lib/translations/form';

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
      component={TextField}
      floatingLabelText={intl.formatMessage(translations.title)}
      fullWidth={true}
      name="title"
      {...{ disabled }}
    />
    <br />
    <Field
      component={TextField}
      floatingLabelText={intl.formatMessage(translations.description)}
      fullWidth={true}
      multiLine={true}
      name="description"
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
