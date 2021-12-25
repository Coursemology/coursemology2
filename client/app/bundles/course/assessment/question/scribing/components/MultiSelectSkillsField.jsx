import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import MultiSelect from 'lib/components/redux-form/MultiSelect';

import { questionIdPrefix, questionNamePrefix } from '../constants';
import { skillShape } from '../propTypes';

const propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.number),
  options: PropTypes.arrayOf(skillShape),
  error: PropTypes.string,
  isLoading: PropTypes.bool,
};

const MultiSelectSkillsField = (props) => {
  const { label, field, value, options, error, isLoading } = props;

  return (
    <Field
      component={MultiSelect}
      error={error}
      id={questionIdPrefix + field}
      isLoading={isLoading}
      label={label}
      name={questionNamePrefix + field}
      options={options}
      value={value}
    />
  );
};

MultiSelectSkillsField.propTypes = propTypes;

export default MultiSelectSkillsField;
