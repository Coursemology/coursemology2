import { ComponentProps, forwardRef, useState } from 'react';
import { InputAdornment, IconButton, Typography } from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';

import useTranslation from 'lib/hooks/useTranslation';
import messagesTranslations from 'lib/translations/messages';
import TextField from './TextField';

type PasswordTextFieldProps = ComponentProps<typeof TextField> & {
  onChangePasswordVisibility?: (visibility: boolean) => void;
  showPasswordVisibilityHint?: boolean;
  disablePasswordVisibilitySwitch?: boolean;
};

const PasswordTextField = forwardRef<HTMLDivElement, PasswordTextFieldProps>(
  (props, ref): JSX.Element => {
    const {
      onChangePasswordVisibility,
      showPasswordVisibilityHint,
      disablePasswordVisibilitySwitch,
      ...textFieldProps
    } = props;

    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const handleChangePasswordVisibility = (): void =>
      setShowPassword((state) => {
        onChangePasswordVisibility?.(!state);
        return !state;
      });

    const textField = (
      <TextField
        {...textFieldProps}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        {...(!disablePasswordVisibilitySwitch && {
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleChangePasswordVisibility}
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

    if (showPasswordVisibilityHint && showPassword)
      return (
        <div>
          {textField}

          <div className="flex items-center space-x-4 text-neutral-500">
            <Visibility />

            <Typography variant="body2">
              {t(messagesTranslations.passwordIsVisible)}
            </Typography>
          </div>
        </div>
      );

    return textField;
  },
);

PasswordTextField.displayName = 'PasswordTextField';

export default PasswordTextField;
