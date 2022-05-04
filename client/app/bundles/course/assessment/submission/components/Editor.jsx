import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import AceEditorField from 'lib/components/form/fields/AceEditorField';

const Editor = (props) => {
  const { readOnly, filename, name, language } = props;
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <AceEditorField
          field={field}
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
