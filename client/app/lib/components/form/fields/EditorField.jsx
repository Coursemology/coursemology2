import AceEditor from 'react-ace';
import PropTypes from 'prop-types';

const FormEditorField = (props) => {
  const {
    field: { name, onChange, value },
    ...custom
  } = props;

  return (
    <AceEditor name={name} onChange={onChange} value={value} {...custom} />
  );
};

FormEditorField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default FormEditorField;
