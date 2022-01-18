import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { change, Field, Form, formValueSelector, reduxForm } from 'redux-form';

import ErrorText, { errorProps } from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import TextField from 'lib/components/redux-form/TextField';

import { connect } from 'react-redux';
import { Tab, Tabs } from 'material-ui';
import { FormattedMessage } from 'react-intl';
import { formNames } from '../constants';
import translations from './translations.intl';

const styles = {
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexRow: {
    display: 'flex',
  },
  flexChild: {
    width: '100%',
  },
};

const MIN_NUM_TO_CREATE = 2;
const MAX_NUM_TO_CREATE = 50;

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

  if (values.is_single === true && values.num_to_create < MIN_NUM_TO_CREATE) {
    errors.num_to_create = translations.numToCreateMin;
  }

  if (values.is_single === true && values.num_to_create > MAX_NUM_TO_CREATE) {
    errors.num_to_create = translations.numToCreateMax;
  }

  return errors;
};

const GroupCreationForm = ({
  dispatch,
  submitting,
  handleSubmit,
  onSubmit,
  isSingle,
  error,
}) => {
  useEffect(() => {
    dispatch(change(formNames.GROUP, 'is_single', true));
  }, []);

  const handleChange = useCallback(
    (value) => {
      dispatch(change(formNames.GROUP, 'is_single', value === 'is_single'));
    },
    [dispatch],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ErrorText errors={error} />
      <Tabs
        value={isSingle ? 'is_single' : 'is_multiple'}
        onChange={handleChange}
      >
        <Tab label="Single" value="is_single">
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
              floatingLabelText={
                <FormattedMessage {...translations.description} />
              }
              multiLine
              disabled={submitting}
              rows={2}
              rowsMax={4}
              style={styles.flexChild}
            />
          </div>
        </Tab>
        <Tab label="Multiple" value="is_multiple">
          <div style={styles.flexCol}>
            <Field
              name="num_to_create"
              component={TextField}
              floatingLabelText={
                <FormattedMessage {...translations.numToCreate} />
              }
              type="number"
              onWheel={(event) => event.currentTarget.blur()}
              disabled={submitting}
              style={styles.flexChild}
              min={MIN_NUM_TO_CREATE}
              max={MAX_NUM_TO_CREATE}
            />
            <Field
              name="name"
              component={TextField}
              floatingLabelText={<FormattedMessage {...translations.prefix} />}
              disabled={submitting}
              style={styles.flexChild}
            />
          </div>
        </Tab>
      </Tabs>
    </Form>
  );
};

GroupCreationForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: errorProps,
  isSingle: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

const formSelector = formValueSelector(formNames.GROUP);

export default connect((state) => ({
  isSingle: formSelector(state, 'is_single'),
}))(
  reduxForm({
    form: formNames.GROUP,
    validate,
  })(GroupCreationForm),
);
