import {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  MutableRefObject,
} from 'react';
import AceEditor from 'react-ace';
import { LanguageMode } from 'types/course/assessment/question/programming';

import 'ace-builds/src-noconflict/theme-github';

import './AceEditor.css';

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
        onPaste={() => {
          const editor = (ref as MutableRefObject<AceEditor>)?.current?.editor;
          if (editor && language === 'python') {
            // delay this until next tick, so replacement function also affects pasted code
            setTimeout(() =>
              editor.replaceAll(' '.repeat(editor.getOption('tabSize') ?? 4), {
                needle: '\t',
              }),
            );
          }
        }}
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
          showInvisibles: true,
        }}
      />
    );
  },
);
EditorField.displayName = 'EditorField';

export default EditorField;
