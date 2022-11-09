import { ComponentProps, HTMLInputTypeAttribute, Ref } from 'react';
import { ControllerFieldState } from 'react-hook-form';

import NumberTextField from 'lib/components/core/fields/NumberTextField';
import PasswordTextField from 'lib/components/core/fields/PasswordTextField';
import TextField from 'lib/components/core/fields/TextField';

import { formatErrorMessage } from './utils/mapError';

// Adapted from old TextField.jsx and DebouncedTextField.jsx
const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px' },
};

type Value = string | number | null;

type TextFieldTypes = HTMLInputTypeAttribute;

const TEXT_FIELDS = {
  number: NumberTextField,
  password: PasswordTextField,
};

type CustomTextFields = typeof TEXT_FIELDS;
type CustomTextFieldTypes = keyof CustomTextFields;
type TextFieldOf<Type extends TextFieldTypes> =
  Type extends CustomTextFieldTypes ? CustomTextFields[Type] : typeof TextField;
type PropsOf<Type extends TextFieldTypes> = ComponentProps<TextFieldOf<Type>>;

type TextFieldProps<Type extends TextFieldTypes> = Omit<
  PropsOf<Type>,
  'type'
> & {
  type?: Type;
};

type FormTextFieldProps<Type extends TextFieldTypes> = TextFieldProps<Type> & {
  field: {
    onChange: (value: Value) => void;
    onBlur: () => void;
    value?: Value;
    name: string;
    ref: Ref<HTMLInputElement>;
  };
  fieldState: ControllerFieldState;
  disableMargins?: boolean;
};

const FormTextField = <Type extends TextFieldTypes>(
  props: FormTextFieldProps<Type>,
): JSX.Element => {
  const {
    field,
    fieldState: { error },
    disableMargins,
    ...textFieldProps
  } = props;

  const elementProps = {
    trims: true,
    ...field,
    error: Boolean(error),
    helperText: error && formatErrorMessage(error.message),
    ...(!disableMargins && { style: styles.textFieldStyle }),
    ...textFieldProps,
  };

  if (props.type === 'number')
    return (
      <NumberTextField
        {...elementProps}
        onChange={(_, value): void => field.onChange(value)}
      />
    );

  if (props.type === 'password')
    return (
      <PasswordTextField
        {...(elementProps as ComponentProps<typeof PasswordTextField>)}
        onChange={(e): void => field.onChange(e.target.value)}
      />
    );

  return (
    <TextField
      {...(elementProps as ComponentProps<typeof TextField>)}
      onChange={(e): void => field.onChange(e.target.value)}
    />
  );
};

export default FormTextField;
