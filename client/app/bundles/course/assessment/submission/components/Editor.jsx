import { Component, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Stack } from '@mui/material';
import PropTypes from 'prop-types';

import FormEditorField from 'lib/components/form/fields/EditorField';
import ResizeObserver from 'utilities/ResizeObserver';

import { fileShape } from '../propTypes';

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
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let frameId;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        editorRef?.current?.editor?.resize();
      });
    });

    observer.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return (
    <Stack spacing={0.5}>
      <Controller
        control={control}
        name={fieldName}
        render={({ field }) => (
          <div
            ref={containerRef}
            className="resize-y overflow-hidden"
            style={{ minHeight: 200, height: 400 }}
          >
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
              height="100%"
              language={language}
              onCursorChange={onCursorChange ?? (() => {})}
              readOnly={false}
            />
          </div>
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
