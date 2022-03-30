import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import AceEditor from 'lib/components/redux-form/AceEditor';

const Editor = (props) => {
  const { readOnly, filename, name, language } = props;
  return (
    <Field
      component={AceEditor}
      name={name}
      filename={filename}
      mode={language}
      theme="github"
      width="100%"
      minLines={25}
      maxLines={25}
      editorProps={{ $blockScrolling: true }}
      setOptions={{ useSoftTabs: true }}
      readOnly={readOnly}
      style={{ marginBottom: 10 }}
    />
  );
};

export default Editor;

Editor.propTypes = {
  readOnly: PropTypes.bool,
  name: PropTypes.string,
  filename: PropTypes.string,
  language: PropTypes.string.isRequired,
};

Editor.defaultProps = {
  readOnly: false,
};
