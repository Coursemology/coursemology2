import { useState, forwardRef, ComponentProps } from 'react';
import {
  InputAdornment,
  TextField as MuiTextField,
  IconButton,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';

type TextFieldProps = ComponentProps<typeof MuiTextField>;

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref): JSX.Element => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <MuiTextField
        ref={ref}
        {...props}
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
      />
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
