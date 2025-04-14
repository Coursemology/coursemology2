import { memo } from 'react';
import PropTypes from 'prop-types';

import CKEditorRichText from '../../core/fields/CKEditorRichText';

import { formatErrorMessage } from './utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

const FormRichTextField = (props) => {
  const { field, fieldState, disabled, label, ...custom } = props;
  const error =
    fieldState.error?.message && formatErrorMessage(fieldState.error?.message);

  return (
    <CKEditorRichText
      {...field}
      disabled={disabled}
      error={error}
      label={label}
      {...custom}
    />
  );
};

FormRichTextField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  fullWidth: PropTypes.bool,
  InputLabelProps: PropTypes.object,
  variant: PropTypes.string,
  disableMargins: PropTypes.bool,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  multiline: PropTypes.bool,
  renderIf: PropTypes.bool,
};

export default memo(FormRichTextField, propsAreEqual);
