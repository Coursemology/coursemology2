import { ComponentProps } from 'react';
import AceEditor from 'react-ace';
import { LanguageMode } from 'types/course/assessment/question/programming';

import 'ace-builds/src-noconflict/theme-github';

interface EditorProps extends ComponentProps<typeof AceEditor> {
  language: LanguageMode;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const EditorField = (props: EditorProps): JSX.Element => {
  const { language, value, disabled, onChange, ...otherProps } = props;

  return (
    <AceEditor
      // Short-circuit this because during build time, `mode` can be `undefined` and
      // `AceEditor` will request for `/webpack/mode-mode.js`, which doesn't exist.
      mode={language || 'python'}
      onChange={onChange}
      theme="github"
      value={value}
      width="100%"
      {...otherProps}
      editorProps={{
        ...otherProps.editorProps,
        $blockScrolling: true,
      }}
      setOptions={{
        ...otherProps.setOptions,
        useSoftTabs: true,
        readOnly: disabled,
        useWorker: false,
      }}
    />
  );
};

export default EditorField;
