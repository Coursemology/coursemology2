import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import MaterialSummernote from 'lib/components/redux-form/RichTextField';

import { questionIdPrefix, questionNamePrefix } from '../constants';

const propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  validate: PropTypes.arrayOf(PropTypes.func),
};

const SummernoteField = (props) => {
  const { label, field, validate } = props;
  return (
    <Field
      component={MaterialSummernote}
      id={questionIdPrefix + field}
      label={label}
      name={questionNamePrefix + field}
      validate={validate}
    />
  );
};

SummernoteField.propTypes = propTypes;

export default SummernoteField;
