import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import MaterialSummernote from 'lib/components/redux-form/RichTextField';
import { questionNamePrefix, questionIdPrefix } from '../constants';

const propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  validate: PropTypes.array,
};

const SummernoteField = (props) => {
  const { label, field, validate } = props;
  return (
    <Field
      name={questionNamePrefix + field}
      id={questionIdPrefix + field}
      label={label}
      validate={validate}
      component={MaterialSummernote}
    />
  );
};

SummernoteField.propTypes = propTypes;

export default SummernoteField;
