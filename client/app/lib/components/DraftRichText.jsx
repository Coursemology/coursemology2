import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { InputLabel } from '@mui/material';

import { cyan } from '@mui/material/colors';

import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';

// Conversion from raw draftjs to HTML and vice versa
// https://jpuri.github.io/react-draft-wysiwyg/#/demo
// https://www.npmjs.com/package/draftjs-to-html
// https://www.npmjs.com/package/html-to-draftjs
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

// Default stylesheet
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// Additional stylesheet to fix stuff
import '../styles/Draft.css';

const DraftRichText = (props) => {
  const {
    label,
    value,
    onChange,
    disabled,
    field,
    required,
    uploadedImages,
    name,
    inputId,
    clearOnSubmit,
  } = props;

  // Set up the editorValue
  const [editorValue, setEditorValue] = useState(() => {
    if (value) {
      const blocksFromHTML = htmlToDraft(value);
      return EditorState.createWithContent(
        ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap,
        ),
      );
    }
    return EditorState.createEmpty();
  });

  // Clear Editor field after comment is submitted, only if clearOnSubmit is true
  useEffect(() => {
    if (disabled && clearOnSubmit) {
      setEditorValue('');
    }
  }, [disabled]);

  // To upload images from local saves
  const uploadImageCallBack = (file) => {
    const imageObject = {
      file,
      localSrc: URL.createObjectURL(file),
    };

    uploadedImages.push(imageObject);

    return new Promise((resolve) => {
      resolve({ data: { link: imageObject.localSrc } });
    });
  };

  const testFieldLabelColor = cyan[500];

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
        style={{
          border: '0.2px solid lightGray',
          borderRadius: '15px',
          padding: '10px',
        }}
      >
        <Editor
          // toolbarHidden
          // toolbarOnFocus
          // readOnly
          spellCheck
          // Toolbar customisation: https://jpuri.github.io/react-draft-wysiwyg/#/docs
          toolbar={{
            options: [
              'blockType',
              'inline',
              'fontFamily',
              'fontSize',
              'colorPicker',
              'list',
              'textAlign',
              'link',
              //   'embedded',
              //   'emoji',
              'image',
              'remove',
              'history',
            ],
            inline: { inDropdown: false },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
            link: { inDropdown: false, options: ['link'] },
            image: {
              uploadCallback: uploadImageCallBack,
              alt: { present: true, mandatory: false },
              previewImage: true,
              alignmentEnabled: false,
            },
            history: { inDropdown: false },
            colorPicker: {
              colors: [
                'rgb(0,0,0)',
                'rgb(235,235,235)',
                'rgb(255,0,0)',
                'rgb(0,255,0)',
                'rgb(0,0,255)',
                'rgb(255,255,0)',
                'rgb(0,255,255)',
                'rgb(255,0,255)',
                'rgb(192,192,192)',
                'rgb(128,128,128)',
                'rgb(128,0,0)',
                'rgb(128,128,0)',
                'rgb(0,128,0)',
                'rgb(128,0,128)',
                'rgb(0,128,128)',
                'rgb(0,0,128)',
              ],
            },
          }}
          placeholder=""
          editorState={editorValue}
          onEditorStateChange={(e) => {
            setEditorValue(e);
            onChange(draftToHtml(convertToRaw(e.getCurrentContent())));
          }}
        />
      </div>
    </div>
  );
};

DraftRichText.propTypes = {
  field: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  inputId: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  uploadedImages: PropTypes.array,
  clearOnSubmit: PropTypes.bool,
};

DraftRichText.defaultProps = {
  uploadedImages: [],
  disabled: false,
  clearOnSubmit: false,
};

export default injectIntl(DraftRichText);
