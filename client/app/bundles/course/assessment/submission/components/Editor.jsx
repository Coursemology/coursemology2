import { Component } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Stack } from '@mui/material';
import PropTypes from 'prop-types';

import FormEditorField from 'lib/components/form/fields/EditorField';

import { fileShape } from '../propTypes';

import ProgrammingFileDownloadChip from './answers/Programming/ProgrammingFileDownloadChip';

const Editor = (props) => {
  const {
    file,
    fieldName,
    language,
    onChangeCallback,
    onCursorChange,
    editorRef,
  } = props;
  const { control } = useFormContext();

  return (
    <Stack spacing={0.5}>
      <div>
        <ProgrammingFileDownloadChip file={file} />
      </div>
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
              },
            }}
            filename={file.filename}
            language={language}
            maxLines={25}
            minLines={25}
            onCursorChange={onCursorChange ?? (() => {})}
            readOnly={false}
            style={{ marginBottom: 10 }}
          />
        )}
      />
    </Stack>
  );
};

Editor.propTypes = {
  fieldName: PropTypes.string.isRequired,
  file: fileShape.isRequired,
  language: PropTypes.string.isRequired,
  onChangeCallback: PropTypes.func.isRequired,
  onCursorChange: PropTypes.func,
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Component) }),
  ]),
};

export default Editor;
