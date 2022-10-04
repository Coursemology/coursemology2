import { ComponentProps, Ref } from 'react';
import { ControllerFieldState } from 'react-hook-form';

import TextField from 'lib/components/TextField';
import NumberTextField from 'lib/components/NumberTextField';
import { formatErrorMessage } from './utils/mapError';

// Adapted from old TextField.jsx and DebouncedTextField.jsx
const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px' },
};

type Value = string | number | null;

type FormTextFieldProps = ComponentProps<typeof TextField> & {
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

type TextFieldPropsWithoutOnChange = Omit<
  ComponentProps<typeof TextField>,
  'onChange'
>;

const FormTextField = (props: FormTextFieldProps): JSX.Element => {
  const {
    field,
    fieldState: { error },
    disableMargins,
    type,
    ...textFieldProps
  } = props;

  const elementProps: TextFieldPropsWithoutOnChange = {
    trims: true,
    ...field,
    error: Boolean(error),
    helperText: error && formatErrorMessage(error.message),
    ...(!disableMargins && { style: styles.textFieldStyle }),
    ...textFieldProps,
  };

  if (type === 'number')
    return (
      <NumberTextField
        {...elementProps}
        onChange={(_, value): void => field.onChange(value)}
      />
    );

  return (
    <TextField
      {...elementProps}
      onChange={(e): void => field.onChange(e.target.value)}
    />
  );
};

export default FormTextField;
