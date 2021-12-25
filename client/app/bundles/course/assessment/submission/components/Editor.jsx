import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import AceEditor from 'lib/components/redux-form/AceEditor';

const Editor = (props) => {
  const { readOnly, filename, name, language } = props;
  return (
    <Field
      component={AceEditor}
      editorProps={{ $blockScrolling: true }}
      filename={filename}
      maxLines={25}
      minLines={25}
      mode={language}
      name={name}
      readOnly={readOnly}
      setOptions={{ useSoftTabs: true }}
      style={{ marginBottom: 10 }}
      theme="github"
      width="100%"
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
