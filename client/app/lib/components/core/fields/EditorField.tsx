import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import AceEditor from 'react-ace';
import { LanguageMode } from 'types/course/assessment/question/programming';

import 'ace-builds/src-noconflict/theme-github';

interface EditorProps extends ComponentProps<typeof AceEditor> {
  language: LanguageMode;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

/**
 * Font family for our Ace Editor, in descending order of priority.
 *
 * For some reasons, Monaco bold (font-weight: 700) renders narrower text widths in
 * Safari, causing the cursor after the bolded texts to be misaligned. The fonts here are
 * what Ace Editor renders by default, minus 'Monaco', which was first in line.
 */
const DEFAULT_FONT_FAMILY = [
  'Menlo',
  'Ubuntu Mono',
  'Consolas',
  'Source Code Pro',
  'source-code-pro',
  'monospace',
].join(',');

const EditorField = forwardRef(
  (props: EditorProps, ref: ForwardedRef<AceEditor>): JSX.Element => {
    const { language, value, disabled, onChange, ...otherProps } = props;

    return (
      <AceEditor
        // Short-circuit this because during build time, `mode` can be `undefined` and
        // `AceEditor` will request for `/webpack/mode-mode.js`, which doesn't exist.
        ref={ref}
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
          fontFamily: DEFAULT_FONT_FAMILY,
        }}
      />
    );
  },
);
EditorField.displayName = 'EditorField';

export default EditorField;
