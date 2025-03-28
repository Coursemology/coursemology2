import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import AceEditor from 'react-ace';
import { LanguageMode } from 'types/course/assessment/question/programming';

import 'ace-builds/src-noconflict/theme-github';

import './AceEditor.css';

interface EditorProps extends ComponentProps<typeof AceEditor> {
  language: LanguageMode;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  cursorStart?: number;
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
    const { language, value, disabled, onChange, cursorStart, ...otherProps } =
      props;

    return (
      <AceEditor
        ref={ref}
        /**
         * This "mode" parameter should match one of the file names in this git directory:
         * https://github.com/thlorenz/brace/tree/master/mode
         *
         * Short-circuit this because during build time, `mode` can be `undefined` and
         * AceEditor will request for `/webpack/mode-mode.js`, which doesn't exist.
         *
         * TODO: This parameter is called by many names in various places in the codebase,
         * such as "language", "editorMode", "languageMode", or "ace_mode".
         * We should standardize to reduce ambiguity, which can be done safely when all relevant
         * components have been moved to TypeScript.
         */
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
        onLoad={(editor) => {
          if (cursorStart !== undefined) {
            editor.getSession().getSelection().moveCursorTo(cursorStart, 0);
          }
          if (language === 'python')
            editor.onPaste = (originalText, event: ClipboardEvent): void => {
              event.preventDefault();

              const spaces = ' '.repeat(editor.getOption('tabSize') ?? 4);
              const text = originalText.replaceAll('\t', spaces);
              editor.commands.exec('paste', editor, { text, event });
            };
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
