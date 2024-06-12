import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';
import { Component } from 'react';

import FormEditorField from 'lib/components/form/fields/EditorField';

import { fileShape } from '../propTypes';

import ProgrammingFileDownloadLink from './answers/Programming/ProgrammingFileDownloadLink';

const Editor = (props) => {
  const { file, fieldName, language, onChangeCallback, onSelectionChange, editorRef } = props;
  const { control } = useFormContext();

  return (
    <>
      <ProgrammingFileDownloadLink file={file} />
      <Controller
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormEditorField
            ref={editorRef}
            field={{
              ...field,
              onChange: (event) => {
                field.onChange(event);
                onChangeCallback();
              }
            }}
            onSelectionChange={onSelectionChange ?? (() => {})}
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
  onSelectionChange: PropTypes.func,
  editorRef: PropTypes.oneOfType([
    PropTypes.func, 
    PropTypes.shape({ current: PropTypes.instanceOf(Component) })
  ]),
};

export default Editor;
