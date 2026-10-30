import { ComponentProps, Ref } from 'react';
import AceEditor from 'react-ace';
import { Controller, useFormContext } from 'react-hook-form';
import { Stack } from '@mui/material';
import { LanguageMode } from 'types/course/assessment/question/programming';

import FormEditorField from 'lib/components/form/fields/EditorField';

interface EditorProps {
  /** The form field holding the file's content, such as `7.files_attributes.0.content`. */
  fieldName: string;
  language: LanguageMode;
  onChangeCallback: () => void;
  onCursorChange?: ComponentProps<typeof AceEditor>['onCursorChange'];
  editorRef?: Ref<AceEditor>;
}

const Editor = (props: EditorProps): JSX.Element => {
  const { fieldName, language, onChangeCallback, onCursorChange, editorRef } =
    props;
  const { control } = useFormContext();

  return (
    <Stack spacing={0.5}>
      <Controller
        control={control}
        name={fieldName}
        render={({ field }): JSX.Element => (
          <FormEditorField
            ref={editorRef}
            field={{
              ...field,
              onChange: (value: string): void => {
                field.onChange(value);
                onChangeCallback();
              },
            }}
            language={language}
            maxLines={25}
            minLines={25}
            onCursorChange={onCursorChange}
            readOnly={false}
          />
        )}
      />
    </Stack>
  );
};

export default Editor;
