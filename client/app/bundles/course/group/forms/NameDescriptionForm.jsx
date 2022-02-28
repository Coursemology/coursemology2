import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import { connect } from 'react-redux';

import ErrorText, { errorProps } from 'lib/components/ErrorText';
import TextField from 'lib/components/redux-form/TextField';
import formTranslations from 'lib/translations/form';
import { formNames } from '../constants';

const translations = defineMessages({
  name: {
    id: 'course.group.nameDescriptionForm.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.group.nameDescriptionForm.description',
    defaultMessage: 'Description (Optional)',
  },
  nameLength: {
    id: 'course.group.nameDescriptionForm.nameLength',
    defaultMessage: 'The name is too long!',
  },
});

const styles = {
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexChild: {
    width: '100%',
  },
};

const isFieldBlank = (str) => str == null || str === '';

const validate = (values) => {
  const errors = {};
  const requiredFields = ['name'];

  requiredFields.forEach((field) => {
    if (isFieldBlank(values[field])) {
      errors[field] = formTranslations.required;
    }
  });

  if ((values.name?.length ?? 0) > 255) {
    errors.name = translations.nameLength;
  }

  return errors;
};

const NameDescriptionForm = ({ submitting, handleSubmit, onSubmit, error }) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <ErrorText errors={error} />
    <div style={styles.flexCol}>
      <Field
        name="name"
        component={TextField}
        label={<FormattedMessage {...translations.name} />}
        disabled={submitting}
        style={styles.flexChild}
      />
      <Field
        name="description"
        component={TextField}
        label={<FormattedMessage {...translations.description} />}
        multiline
        disabled={submitting}
        rows={2}
        rowsMax={4}
        style={styles.flexChild}
      />
    </div>
  </Form>
);

NameDescriptionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: errorProps,
  onSubmit: PropTypes.func.isRequired,
};

export default connect()(
  reduxForm({
    form: formNames.GROUP,
    validate,
  })(NameDescriptionForm),
);
