import {
  ChangeEventHandler,
  ComponentProps,
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
} from 'react';
import { TextField as MuiTextField } from '@mui/material';

type TextFieldProps = ComponentProps<typeof MuiTextField> & {
  trims?: boolean;
  onPressEnter?: () => void;
  onPressEscape?: () => void;
};

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref): JSX.Element => {
    const { trims, onPressEnter, onPressEscape, ...textFieldProps } = props;

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

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e): void => {
      if (
        onPressEnter &&
        e.key === 'Enter' &&
        (!textFieldProps.multiline || !e.shiftKey)
      ) {
        e.preventDefault();
        onPressEnter();
      }

      if (onPressEscape && e.key === 'Escape') {
        e.preventDefault();
        onPressEscape();
      }

      return props.onKeyDown?.(e);
    };

    return (
      <MuiTextField
        {...textFieldProps}
        inputRef={ref}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
