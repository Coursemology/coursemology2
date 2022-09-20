import {
  ChangeEventHandler,
  ComponentProps,
  FocusEventHandler,
  KeyboardEventHandler,
  Ref,
} from 'react';
import { ControllerFieldState } from 'react-hook-form';

import TextField from 'lib/components/TextField';
import { formatErrorMessage } from './utils/mapError';

// Adapted from old TextField.jsx and DebouncedTextField.jsx
const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px' },
};

const onlyNumberInput: KeyboardEventHandler<HTMLInputElement> = (e): void => {
  if (e.which === 8) return;
  if (e.which < 48 || e.which > 57) e.preventDefault();
};

type FormTextFieldProps = ComponentProps<typeof TextField> & {
  field: {
    onChange: (value: string | number) => void;
    onBlur: () => void;
    value?: string | number;
    name: string;
    ref: Ref<HTMLInputElement>;
  };
  fieldState: ControllerFieldState;
  disableMargins?: boolean;
};

const FormTextField = (props: FormTextFieldProps): JSX.Element => {
  const {
    field,
    fieldState: { error },
    disableMargins,
    ...textFieldProps
  } = props;

  const processValue = (
    input?: string | number,
    trimStart = false,
  ): string | number => {
    if (typeof input === 'number') return input;

    const value = (trimStart ? input?.trimStart() : input?.trim()) ?? '';
    if (!trimStart && props.type === 'number') return parseInt(value, 10) || 0;
    return value;
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e): void => {
    e.persist();
    field.onChange(processValue(e.target.value, true));
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e): void => {
    field.onChange(processValue(e.target.value));
    field.onBlur();
  };

  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (e): void => {
    if (props.type === 'number') onlyNumberInput(e);
    if (e.key === 'Enter') {
      e.preventDefault();
      field.onChange(processValue(field.value));
    }
  };

  return (
    <TextField
      {...field}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyPress}
      error={Boolean(error)}
      helperText={error && formatErrorMessage(error.message)}
      {...(!disableMargins && { style: styles.textFieldStyle })}
      {...textFieldProps}
    />
  );
};

export default FormTextField;
