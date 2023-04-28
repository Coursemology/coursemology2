import { Typography } from '@mui/material';

import TextField from 'lib/components/core/fields/TextField';

interface ExpressionFieldProps {
  value: string;
  error?: string;
  onChange?: (value: string) => void;
  plain?: boolean;
  disabled?: boolean;
}

const ExpressionField = (props: ExpressionFieldProps): JSX.Element => {
  return (
    <div className="flex h-full flex-col">
      <TextField
        className="-mx-2 h-full rounded-lg bg-neutral-100 focus-within:bg-neutral-200/70 focus-within:ring-2 hover:bg-neutral-200/70"
        disabled={props.disabled}
        fullWidth
        hiddenLabel
        InputProps={{
          className: `p-2 text-[1.3rem] h-full ${
            props.plain ? '' : 'font-mono'
          }`,
          disableUnderline: true,
        }}
        multiline
        onChange={(e): void => props.onChange?.(e.target.value)}
        size="small"
        spellCheck={false}
        value={props.value}
        variant="standard"
      />

      {props.error && (
        <Typography color="error" variant="body2">
          {props.error}
        </Typography>
      )}
    </div>
  );
};

export default ExpressionField;
