import { ComponentProps, createElement, ElementType, forwardRef } from 'react';
import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  FormHelperText,
  Typography,
} from '@mui/material';

import InfoLabel from '../InfoLabel';

type CheckboxProps = ComponentProps<typeof MuiCheckbox> & {
  component?: ElementType;
  label?: string | JSX.Element;
  description?: string;
  disabledHint?: string | JSX.Element;
  error?: string;
  variant?: ComponentProps<typeof Typography>['variant'];
  descriptionVariant?: ComponentProps<typeof Typography>['variant'];
  labelClassName?: string;
};

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (props, ref): JSX.Element => {
    const {
      component,
      label,
      dangerouslySetInnerHTML,
      description,
      descriptionVariant,
      disabledHint,
      error,
      labelClassName,
      variant,
      ...checkboxProps
    } = props;

    const textVariant =
      variant ?? (props.size === 'small' ? 'body2' : undefined);

    return (
      <div>
        <FormControlLabel
          className={`mb-0 ${props.readOnly ? 'cursor-auto' : ''} ${
            labelClassName ?? ''
          }`}
          componentsProps={{ typography: { variant: textVariant } }}
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
                variant={textVariant}
              />
            ) : (
              label
            )
          }
        />

        <div
          className={`${
            props.size === 'small' ? 'ml-[2.9rem]' : 'ml-[3.4rem]'
          } space-y-2`}
        >
          {description && (
            <Typography
              color={props.disabled ? 'text.disabled' : 'text.secondary'}
              variant={
                descriptionVariant ??
                (props.size === 'small' ? 'caption' : 'body2')
              }
            >
              {description}
            </Typography>
          )}

          {props.disabled && disabledHint && <InfoLabel label={disabledHint} />}

          {error && (
            <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

Checkbox.defaultProps = {
  component: MuiCheckbox,
};

export default Checkbox;
