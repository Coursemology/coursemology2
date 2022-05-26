/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { InputLabel } from '@mui/material';
import { cyan } from '@mui/material/colors';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from '@ckeditor/ckeditor5-build-custom';

import axios from 'lib/axios';

interface Props {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  disabled: boolean;
  field: string | undefined;
  required: boolean | undefined;
  name: string;
  inputId: string;
  clearOnSubmit: boolean;
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

  // Any type used as there is no documentation on the type
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
        onChange={onChange}
        disabled={disabled}
      />

      <div
        className="react-ck"
        style={{
          border: '0.2px solid lightGray',
          borderRadius: '15px',
          padding: '10px',
        }}
      >
        <CKEditor
          editor={CustomEditor}
          config={{
            mediaEmbed: {
              elementName: 'iframe',
              previewsInData: false,
              removeProviders: [
                'instagram',
                'twitter',
                'googleMaps',
                'flickr',
                'facebook',
              ],
            },
            toolbar: {
              items: [
                'heading',
                'fontSize',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'code',
                'codeBlock',
                'blockQuote',
                'removeFormat',
                '|',
                'subscript',
                'superscript',
                '|',
                'fontFamily',
                'fontColor',
                'highlight',
                '|',
                'indent',
                'outdent',
                'bulletedList',
                'numberedList',
                'alignment',
                'horizontalLine',
                '|',
                'insertTable',
                '|',
                'link',
                'imageUpload',
                'mediaEmbed',
                '|',
                'findAndReplace',
                'specialCharacters',
              ],
            },
          }}
          data=""
          onReady={(editor) => {
            setMyEditor(editor);
            if (value) {
              editor.setData(value);
            }
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
        />
      </div>
    </div>
  );
};

CKEditorRichText.displayName = 'CKEditor';

export default CKEditorRichText;
