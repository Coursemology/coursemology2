import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import AceEditorField from 'lib/components/form/fields/AceEditorField';

const Editor = (props) => {
  const { readOnly, filename, name, language } = props;
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <AceEditorField
          editorProps={{ $blockScrolling: true }}
          field={field}
          filename={filename}
          maxLines={25}
          minLines={25}
          mode={language}
          readOnly={readOnly}
          setOptions={{ useSoftTabs: true }}
          style={{ marginBottom: 10 }}
          theme="github"
          width="100%"
        />
      )}
    />
  );
};

Editor.propTypes = {
  readOnly: PropTypes.bool,
  name: PropTypes.string,
  filename: PropTypes.string,
  language: PropTypes.string.isRequired,
};

Editor.defaultProps = {
  readOnly: false,
};

export default Editor;
