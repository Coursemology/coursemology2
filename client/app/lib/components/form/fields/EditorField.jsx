import PropTypes from 'prop-types';

import EditorField from 'lib/components/core/fields/EditorField';

const FormEditorField = (props) => {
  const {
    field: { name, onChange, value },
    ...custom
  } = props;

  return (
    <EditorField name={name} onChange={onChange} value={value} {...custom} />
  );
};

FormEditorField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default FormEditorField;
