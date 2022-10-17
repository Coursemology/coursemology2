import { ComponentProps, forwardRef } from 'react';
import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  FormHelperText,
  Typography,
} from '@mui/material';

type CheckboxProps = ComponentProps<typeof MuiCheckbox> & {
  label?: string;
  description?: string;
  disabledHint?: string | JSX.Element;
  error?: string;
};

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (props, ref): JSX.Element => {
    const { label, description, disabledHint, error, ...checkboxProps } = props;

    return (
      <div>
        <FormControlLabel
          control={
            <MuiCheckbox
              ref={ref}
              {...checkboxProps}
              color="primary"
              className="py-0 px-4"
            />
          }
          disabled={checkboxProps.disabled}
          label={label}
          className="mb-0"
        />

        <div className="ml-[34px] space-y-2">
          {description && (
            <Typography
              variant="body2"
              color={
                checkboxProps.disabled ? 'text.disabled' : 'text.secondary'
              }
            >
              {description}
            </Typography>
          )}

          {checkboxProps.disabled && disabledHint}

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
