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
  variant?: ComponentProps<typeof Typography>['variant'];
  labelClassName?: string;
};

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (props, ref): JSX.Element => {
    const {
      component,
      label,
      dangerouslySetInnerHTML,
      description,
      disabledHint,
      error,
      labelClassName,
      variant,
      ...checkboxProps
    } = props;

    return (
      <div>
        <FormControlLabel
          className={`mb-0 ${props.readOnly ? 'cursor-auto' : ''} ${
            labelClassName ?? ''
          }`}
          control={createElement(component ?? MuiCheckbox, {
            ref,
            ...checkboxProps,
            checked: props.readOnly ? Boolean(props.checked) : props.checked,
            className: `py-0 px-4 ${props.className ?? ''}`,
            color: props.color ?? 'primary',
            disableRipple: props.disableRipple ?? props.readOnly,
            inputProps: {
              ...props.inputProps,
              className: `cursor-default ${props.inputProps?.className ?? ''}`,
            },
          })}
          disabled={props.disabled}
          label={
            dangerouslySetInnerHTML ? (
              <Typography
                dangerouslySetInnerHTML={dangerouslySetInnerHTML}
                variant={variant}
              />
            ) : (
              label
            )
          }
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
