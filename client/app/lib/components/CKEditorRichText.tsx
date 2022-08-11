/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { FC, useEffect, useState } from 'react';
import { InputLabel } from '@mui/material';
import { cyan } from '@mui/material/colors';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from '@ckeditor/ckeditor5-build-custom';
import axios from 'lib/axios';

interface Props {
  label?: string;
  value: string;
  onChange: (text: string) => void;
  disabled: boolean;
  field?: string | undefined;
  required?: boolean | undefined;
  name: string;
  inputId: string;
  clearOnSubmit?: boolean;
}

const CKEditorRichText: FC<Props> = (props: Props) => {
  const {
    label,
    value,
    onChange,
    disabled,
    field,
    required,
    name,
    inputId,
    clearOnSubmit,
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const testFieldLabelColor = isFocused ? cyan[500] : undefined;

  // Any type used as there is no documentation on the typing of CKEditor's editor object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myEditor, setMyEditor] = useState<any>();

  // Clear Editor field after comment is submitted, only if clearOnSubmit is true
  useEffect(() => {
    if (!disabled && clearOnSubmit && myEditor) {
      myEditor.setData('');
    }
  }, [disabled]);

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

  return (
    <div
      style={{
        fontSize: 16,
        width: '100%',
        display: 'inline-block',
        position: 'relative',
        backgroundColor: 'transparent',
        fontFamily: 'Roboto, sans-serif',
        paddingTop: label ? '1em' : 0,
        paddingBottom: '1em',
      }}
    >
      <InputLabel
        disabled={disabled}
        htmlFor={field}
        required={required}
        shrink
        style={{
          pointerEvents: 'none',
          color: disabled ? 'rgba(0, 0, 0, 0.3)' : testFieldLabelColor,
        }}
      >
        {label}
      </InputLabel>
      <textarea
        name={name}
        id={inputId}
        required={required}
        value={value || ''}
        style={{ display: 'none' }}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        disabled={disabled}
      />

      <div className="react-ck">
        <CKEditor
          editor={CustomEditor}
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
          }}
          data=""
          onReady={(editor) => {
            setMyEditor(editor);
            if (value) {
              editor.setData(value);
            }
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
          }}
          onChange={(_event, editor) => {
            onChange(editor.getData());
          }}
          onBlur={(_event, _editor) => {
            setIsFocused(false);
          }}
          onFocus={(_event, _editor) => {
            setIsFocused(true);
          }}
          style={{ minHeight: 500 }}
        />
      </div>
    </div>
  );
};

CKEditorRichText.displayName = 'CKEditor';

export default CKEditorRichText;
