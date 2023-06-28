import { ComponentProps, forwardRef, useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

import TextField from './TextField';

type PasswordTextFieldProps = ComponentProps<typeof TextField> & {
  onChangePasswordVisibility?: (visibility: boolean) => void;
  disablePasswordVisibilitySwitch?: boolean;
};

const PasswordTextField = forwardRef<HTMLDivElement, PasswordTextFieldProps>(
  (props, ref): JSX.Element => {
    const {
      onChangePasswordVisibility,
      disablePasswordVisibilitySwitch,
      ...textFieldProps
    } = props;

    const [showPassword, setShowPassword] = useState(false);

    const handleChangePasswordVisibility = (): void =>
      setShowPassword((state) => {
        onChangePasswordVisibility?.(!state);
        return !state;
      });

    return (
      <TextField
        {...textFieldProps}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        {...(!disablePasswordVisibilitySwitch && {
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={handleChangePasswordVisibility}
                  onMouseDown={(e): void => e.preventDefault()}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          },
        })}
      />
    );
  },
);

PasswordTextField.displayName = 'PasswordTextField';

export default PasswordTextField;
