import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import { connect } from 'react-redux';

import ErrorText, { errorProps } from 'lib/components/ErrorText';
import TextField from 'lib/components/redux-form/TextField';
import formTranslations from 'lib/translations/form';
import translations from './translations.intl';
import { formNames } from '../../constants';

const styles = {
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexChild: {
    width: '100%',
  },
  toggle: {
    marginTop: 16,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
  conditions: {
    marginTop: 24,
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

const CategoryForm = ({ submitting, handleSubmit, onSubmit, error }) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <ErrorText errors={error} />
    <div style={styles.flexCol}>
      <Field
        name="name"
        component={TextField}
        floatingLabelText={<FormattedMessage {...translations.name} />}
        disabled={submitting}
        style={styles.flexChild}
      />
      <Field
        name="description"
        component={TextField}
        floatingLabelText={<FormattedMessage {...translations.description} />}
        multiLine
        disabled={submitting}
        rows={2}
        rowsMax={4}
        style={styles.flexChild}
      />
    </div>
  </Form>
);

CategoryForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: errorProps,
  onSubmit: PropTypes.func.isRequired,
};

export default connect()(
  reduxForm({
    form: formNames.GROUP_CATEGORY,
    validate,
  })(CategoryForm),
);
