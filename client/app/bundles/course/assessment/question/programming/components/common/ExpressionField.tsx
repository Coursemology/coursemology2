import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import TextField from 'lib/components/core/fields/TextField';

interface ExpressionFieldProps {
  value: string;
  error?: string;
  onChange?: (value: string) => void;
  plain?: boolean;
  disabled?: boolean;
  label?: string;
}

const ExpressionField = forwardRef<HTMLDivElement, ExpressionFieldProps>(
  (props, ref): JSX.Element => (
    <div className="flex h-full w-[27%] flex-col">
      <TextField
        ref={ref}
        className={`-mx-2 h-full rounded-lg ${
          props.disabled
            ? 'bg-neutral-200'
            : 'bg-neutral-100 focus-within:bg-neutral-200/70 focus-within:ring-2 hover:bg-neutral-200/70'
        }`}
        disabled={props.disabled}
        fullWidth
        InputProps={{
          className: `text-[1.3rem] h-full ${props.plain ? '' : 'font-mono'}`,
          disableUnderline: true,
        }}
        label={props.label ?? ''}
        multiline
        onChange={(e): void => props.onChange?.(e.target.value)}
        size="small"
        spellCheck={false}
        value={props.value}
        variant="filled"
      />

      {props.error && (
        <Typography color="error" variant="body2">
          {props.error}
        </Typography>
      )}
    </div>
  ),
);

ExpressionField.displayName = 'ExpressionField';

export default ExpressionField;
