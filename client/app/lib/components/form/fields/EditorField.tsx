import { ComponentPropsWithoutRef, forwardRef } from 'react';
import AceEditor from 'react-ace';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import EditorField from 'lib/components/core/fields/EditorField';

type FormEditorFieldProps = Omit<
  ComponentPropsWithoutRef<typeof EditorField>,
  'name' | 'onChange' | 'value'
> & {
  field: ControllerRenderProps<FieldValues, string>;
};

const FormEditorField = forwardRef<AceEditor, FormEditorFieldProps>(
  (props, ref): JSX.Element => {
    const {
      field: { name, onChange, value },
      ...custom
    } = props;

    return (
      <EditorField
        name={name}
        onChange={onChange}
        value={value}
        {...custom}
        ref={ref}
      />
    );
  },
);
FormEditorField.displayName = 'FormEditorField';

export default FormEditorField;
