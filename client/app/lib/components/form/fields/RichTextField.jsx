import { memo } from 'react';
import PropTypes from 'prop-types';
import CKEditorRichText from '../../CKEditorRichText';
import propsAreEqual from './utils/propsAreEqual';

const FormRichTextField = (props) => {
  const { field, fieldState, disabled, label, ...custom } = props;

  return (
    <CKEditorRichText
      {...field}
      disabled={disabled}
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
};

export default memo(FormRichTextField, propsAreEqual);
