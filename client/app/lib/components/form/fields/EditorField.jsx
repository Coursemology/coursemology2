import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import EditorField from 'lib/components/core/fields/EditorField';

const FormEditorField = forwardRef((props, ref) => {
  const {
    field: { name, onChange, value },
    ...custom
  } = props;

  return (
    <EditorField name={name} onChange={onChange} value={value} {...custom} ref={ref} />
  );
});

FormEditorField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default FormEditorField;
