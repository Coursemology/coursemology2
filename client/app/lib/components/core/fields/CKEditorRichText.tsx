/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { forwardRef, useState } from 'react';
import CustomEditor from '@ckeditor/ckeditor5-build-custom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { FormHelperText, InputLabel } from '@mui/material';
import { cyan } from '@mui/material/colors';

import axios from 'lib/axios';

import './CKEditor.css';

interface Props {
  name: string;
  onChange: (text: string) => void;
  value: string;
  inputId?: string;
  autofocus?: boolean;
  disabled?: boolean;
  disableMargins?: boolean;
  error?: string;
  field?: string | undefined;
  label?: string;
  placeholder?: string;
  required?: boolean | undefined;
}

const uploadAdapter = (loader) => {
  return {
    upload: () =>
      new Promise((resolve, reject) => {
        const formData = new FormData();

        loader.file.then((file) => {
          formData.append('file', file);
          formData.append('name', file.name);
          axios
            .post('/attachments', formData)
            .then((response) => response.data)
            .then((data) => {
              if (data.success) {
                resolve({ default: `/attachments/${data.id}` });
              }
            })
            .catch((err) => {
              reject(err);
            });
        });
      }),
    abort: () => {},
  };
};

const CKEditorRichText = forwardRef((props: Props, ref) => {
  const {
    label,
    value,
    onChange,
    disabled,
    error,
    field,
    required,
    name,
    inputId,
    disableMargins,
    placeholder,
    autofocus,
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const textFieldLabelColor = isFocused ? cyan[500] : undefined;

  return (
    <div
      style={{
        fontSize: 16,
        width: '100%',
        display: 'inline-block',
        position: 'relative',
        backgroundColor: 'transparent',
        fontFamily: 'Roboto, sans-serif',
        paddingTop: !disableMargins && label ? '1em' : 0,
        paddingBottom: !disableMargins ? '1em' : 0,
      }}
    >
      {label && (
        <InputLabel
          disabled={disabled}
          error={!!error}
          htmlFor={field}
          required={required}
          shrink
          style={{
            pointerEvents: 'none',
            color: disabled ? 'rgba(0, 0, 0, 0.3)' : textFieldLabelColor,
          }}
        >
          {label}
        </InputLabel>
      )}
      <textarea
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        required={required}
        style={{ display: 'none' }}
        value={value || ''}
      />
      <div className="react-ck">
        <CKEditor
          ref={ref}
          config={{
            // To format <pre> properly (summernote compatability).
            // CKEditor will change it to <pre><code> but on edit it will render properly
            heading: {
              options: [
                { model: 'formatted', view: 'pre', title: 'Formatted' },
              ],
            },
            // To add the default https protocol and
            // an option to open the link in a new tab.
            link: {
              defaultProtocol: 'https://',
              decorators: {
                openInNewTab: {
                  mode: 'manual',
                  label: 'Open in a new tab',
                  attributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  },
                },
              },
            },
            placeholder,
          }}
          data={value}
          disabled={disabled}
          editor={CustomEditor}
          onBlur={(_event, _editor) => {
            setIsFocused(false);
          }}
          onChange={(_event, editor) => {
            onChange(editor.getData());
          }}
          onFocus={(_event, _editor) => {
            setIsFocused(true);
          }}
          onReady={(editor) => {
            // Enable the following to set a max height for ckeditor
            editor.editing.view.change((writer) => {
              writer.setStyle(
                'max-height',
                '350px',
                editor.editing.view.document.getRoot(),
              );
            });
            editor.plugins.get('FileRepository').createUploadAdapter = (
              loader,
            ) => {
              return uploadAdapter(loader);
            };
            if (autofocus) editor.focus();
          }}
        />
      </div>
      {error && <FormHelperText error={!!error}>{error}</FormHelperText>}
    </div>
  );
});

CKEditorRichText.displayName = 'CKEditor';

export default CKEditorRichText;
