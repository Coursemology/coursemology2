import AceEditor from 'react-ace';
import PropTypes from 'prop-types';

const AceEditorField = (props) => {
  const {
    field: { name, onChange, value },
    ...custom
  } = props;

  return (
    <AceEditor name={name} onChange={onChange} value={value} {...custom} />
  );
};

AceEditorField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default AceEditorField;
