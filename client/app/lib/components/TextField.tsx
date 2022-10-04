import {
  useState,
  forwardRef,
  ComponentProps,
  ChangeEventHandler,
  FocusEventHandler,
} from 'react';
import {
  InputAdornment,
  TextField as MuiTextField,
  IconButton,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';

type TextFieldProps = ComponentProps<typeof MuiTextField> & {
  trims?: boolean;
};

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref): JSX.Element => {
    const { trims, ...textFieldProps } = props;
    const [showPassword, setShowPassword] = useState(false);

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
        {...(props.type === 'password' && {
          type: showPassword ? 'text' : 'password',
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={(): void => setShowPassword((state) => !state)}
                  onMouseDown={(e): void => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        })}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
