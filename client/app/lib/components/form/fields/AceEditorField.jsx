import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

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
