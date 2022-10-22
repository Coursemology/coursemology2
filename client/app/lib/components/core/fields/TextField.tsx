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
  Typography,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import messagesTranslations from 'lib/translations/messages';
import useTranslation from 'lib/hooks/useTranslation';

type TextFieldProps = ComponentProps<typeof MuiTextField> & {
  trims?: boolean;
  onChangePasswordVisibility?: (visibility: boolean) => void;
  showPasswordVisibilityHint?: boolean;
  disablePasswordVisibilitySwitch?: boolean;
};

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref): JSX.Element => {
    const {
      trims,
      onChangePasswordVisibility,
      showPasswordVisibilityHint,
      disablePasswordVisibilitySwitch,
      ...textFieldProps
    } = props;

    const { t } = useTranslation();
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

    const handleChangePasswordVisibility = (): void =>
      setShowPassword((state) => {
        onChangePasswordVisibility?.(!state);
        return !state;
      });

    const component = (
      <MuiTextField
        {...textFieldProps}
        inputRef={ref}
        {...(props.type === 'password' && {
          type: showPassword ? 'text' : 'password',
          ...(!disablePasswordVisibilitySwitch && {
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
          }),
        })}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );

    if (props.type === 'password' && showPasswordVisibilityHint && showPassword)
      return (
        <div>
          {component}

          <div className="flex items-center space-x-4 text-neutral-500">
            <Visibility />

            <Typography variant="body2">
              {t(messagesTranslations.passwordIsVisible)}
            </Typography>
          </div>
        </div>
      );

    return component;
  },
);

TextField.displayName = 'TextField';

export default TextField;
