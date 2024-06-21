import { forwardRef } from 'react';
import PropTypes from 'prop-types';

import EditorField from 'lib/components/core/fields/EditorField';

const FormEditorField = forwardRef((props, ref) => {
  const {
    field: { name, onChange, value },
    ...custom
  } = props;

  return (
    <EditorField
      name={name}
      onChange={onChange}
      value={value}
      {...custom}
      ref={ref}
    />
  );
});
FormEditorField.displayName = 'FormEditorField';

FormEditorField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default FormEditorField;
