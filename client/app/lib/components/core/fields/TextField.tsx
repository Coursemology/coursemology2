import {
  forwardRef,
  ComponentProps,
  ChangeEventHandler,
  FocusEventHandler,
} from 'react';
import { TextField as MuiTextField } from '@mui/material';

type TextFieldProps = ComponentProps<typeof MuiTextField> & {
  trims?: boolean;
};

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref): JSX.Element => {
    const { trims, ...textFieldProps } = props;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e): void => {
      if (trims) {
        e.target.value = e.target.value.trimStart();
      }

      return props.onChange?.(e);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (e): void => {
      if (trims) {
        e.target.value = e.target.value.trim();
        props.onChange?.(e);
      }

      return props.onBlur?.(e);
    };

    return (
      <MuiTextField
        {...textFieldProps}
        inputRef={ref}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
