import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import renderTextField from 'lib/components/redux-form/TextField';
import { questionNamePrefix, questionIdPrefix } from '../constants';

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
        name={questionNamePrefix + field}
        id={questionIdPrefix + field}
        validate={validate}
        label={(required ? '* ' : '') + label}
        fullWidth
        type={type}
        component={renderTextField}
        disabled={isLoading}
      />
    </div>
  );
};

InputField.propTypes = propTypes;

export default InputField;
