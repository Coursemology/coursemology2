import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import { questionNamePrefix, questionIdPrefix } from '../constants';

const propTypes = {
  placeholder: PropTypes.string,
  field: PropTypes.string.isRequired,
  validate: PropTypes.array,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  type: PropTypes.string,
  isLoading: PropTypes.bool,
};

const InputField = (props) => {
  const { placeholder, field, validate, label, required,
          type, isLoading } = props;

  return (
    <div title={placeholder}>
      <Field
        name={questionNamePrefix + field}
        id={questionIdPrefix + field}
        validate={validate}
        floatingLabelText={(required ? '* ' : '') + label}
        floatingLabelFixed
        fullWidth
        type={type}
        component={TextField}
        disabled={isLoading}
      />
    </div>
  );
};

InputField.propTypes = propTypes;

export default InputField;
