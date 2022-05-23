import { memo } from 'react';
import PropTypes from 'prop-types';
import DraftRichText from '../../DraftRichText';
import propsAreEqual from './utils/propsAreEqual';

const FormRichTextField = (props) => {
  const { field, fieldState, disabled, label, ...custom } = props;

  return (
    <DraftRichText {...field} disabled={disabled} label={label} {...custom} />
  );
};

FormRichTextField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
};

export default memo(FormRichTextField, propsAreEqual);
