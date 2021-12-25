import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import TextField from 'lib/components/redux-form/TextField';

import { questionIdPrefix, questionNamePrefix } from '../constants';

const propTypes = {
  placeholder: PropTypes.string,
  field: PropTypes.string.isRequired,
  validate: PropTypes.arrayOf(PropTypes.func),
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  type: PropTypes.string,
  isLoading: PropTypes.bool,
};

const InputField = (props) => {
  const { placeholder, field, validate, label, required, type, isLoading } =
    props;

  return (
    <div title={placeholder}>
      <Field
        component={TextField}
        disabled={isLoading}
        floatingLabelFixed={true}
        floatingLabelText={(required ? '* ' : '') + label}
        fullWidth={true}
        id={questionIdPrefix + field}
        name={questionNamePrefix + field}
        type={type}
        validate={validate}
      />
    </div>
  );
};

InputField.propTypes = propTypes;

export default InputField;
