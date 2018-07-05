import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import MultiSelect from 'lib/components/redux-form/MultiSelect';
import { questionNamePrefix, questionIdPrefix } from '../constants';
import { skillShape } from '../propTypes';

const propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(skillShape),
  options: PropTypes.arrayOf(skillShape),
  error: PropTypes.string,
  isLoading: PropTypes.bool,
};

const MultiSelectSkillsField = (props) => {
  const { label, field, value, options, error, isLoading } = props;

  return (
    <Field
      name={questionNamePrefix + field}
      id={questionIdPrefix + field}
      component={MultiSelect}
      label={label}
      value={value}
      options={options}
      error={error}
      isLoading={isLoading}
    />
  );
};

MultiSelectSkillsField.propTypes = propTypes;

export default MultiSelectSkillsField;
