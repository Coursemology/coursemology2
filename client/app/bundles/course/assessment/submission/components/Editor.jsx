import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';
import AceEditor from 'react-ace';

class Editor extends Component {
  static propTypes = {
    filename: PropTypes.string,
    language: PropTypes.string.isRequired,
    input: PropTypes.shape({
      onChange: PropTypes.func,
    }).isRequired,
  }

  render() {
    const { filename, language, input: { onChange, value } } = this.props;
    return (
      <AceEditor
        name={filename}
        mode={language}
        theme="github"
        width="100%"
        minLines={25}
        maxLines={25}
        value={value}
        onChange={newValue => onChange(newValue)}
        editorProps={{ $blockScrolling: true }}
        setOptions={{ useSoftTabs: true }}
      />
    );
  }
}

export default props => <Field {...props} component={Editor} />;
