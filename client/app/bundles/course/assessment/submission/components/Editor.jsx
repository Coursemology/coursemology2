import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import FormEditorField from 'lib/components/form/fields/EditorField';

import { fileShape } from '../propTypes';

import ProgrammingFileDownloadLink from './answers/Programming/ProgrammingFileDownloadLink';

const Editor = (props) => {
  const { file, fieldName, language, onChangeCallback } = props;
  const { control } = useFormContext();

  return (
    <>
      <ProgrammingFileDownloadLink file={file} />
      <Controller
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormEditorField
            field={{
              ...field,
              onChange: (event) => {
                field.onChange(event);
                onChangeCallback();
              },
            }}
            filename={file.filename}
            language={language}
            maxLines={25}
            minLines={25}
            readOnly={false}
            style={{ marginBottom: 10 }}
          />
        )}
      />
    </>
  );
};

Editor.propTypes = {
  fieldName: PropTypes.string.isRequired,
  file: fileShape.isRequired,
  language: PropTypes.string.isRequired,
  onChangeCallback: PropTypes.func.isRequired,
};

export default Editor;
