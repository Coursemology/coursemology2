import { ComponentProps, createElement, ElementType, forwardRef } from 'react';
import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  FormHelperText,
  Typography,
} from '@mui/material';

type CheckboxProps = ComponentProps<typeof MuiCheckbox> & {
  component?: ElementType;
  label?: string;
  description?: string;
  disabledHint?: string | JSX.Element;
  error?: string;
};

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (props, ref): JSX.Element => {
    const {
      component,
      label,
      description,
      disabledHint,
      error,
      ...checkboxProps
    } = props;

    return (
      <div>
        <FormControlLabel
          className="mb-0"
          control={createElement(component ?? MuiCheckbox, {
            ref,
            ...checkboxProps,
            className: `py-0 px-4 ${props.className ?? ''}`,
            color: props.color ?? 'primary',
          })}
          disabled={checkboxProps.disabled}
          label={label}
        />

        <div className="ml-[34px] space-y-2">
          {description && (
            <Typography
              color={props.disabled ? 'text.disabled' : 'text.secondary'}
              variant="body2"
            >
              {description}
            </Typography>
          )}

          {props.disabled && disabledHint}

          {error && (
            <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
