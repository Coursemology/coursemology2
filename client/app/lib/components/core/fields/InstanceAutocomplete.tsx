import { ReactNode } from 'react';
import { Autocomplete, Box } from '@mui/material';

import TextField from 'lib/components/core/fields/TextField';

export interface InstanceOption {
  id: number;
  name: string;
}

interface Props {
  options: InstanceOption[];
  value: number | null;
  onChange: (instanceId: number | null) => void;
  label: ReactNode;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  onBlur?: () => void;
}

/**
 * Presentational instance picker shared by the course-duplication destination form and the
 * system-admin marketplace allow-list form. Framework-agnostic: the caller supplies the option
 * list and a plain value/onChange pair, so it works with react-hook-form or bare useState alike.
 */
const InstanceAutocomplete = ({
  options,
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  error = false,
  helperText,
  onBlur,
}: Props): JSX.Element => {
  const selected = options.find((option) => option.id === value) ?? null;

  return (
    <Autocomplete
      disabled={disabled}
      fullWidth
      getOptionLabel={(option): string => option.name}
      isOptionEqualToValue={(option, chosen): boolean =>
        option.id === chosen.id
      }
      onBlur={onBlur}
      onChange={(_, option): void => onChange(option?.id ?? null)}
      options={options}
      renderInput={(inputProps): JSX.Element => (
        <TextField
          {...inputProps}
          error={error}
          helperText={helperText}
          label={label}
          required={required}
          variant="standard"
        />
      )}
      renderOption={(optionProps, option): JSX.Element => (
        <Box component="li" {...optionProps} key={option.id}>
          {option.name}
        </Box>
      )}
      value={selected}
    />
  );
};

export default InstanceAutocomplete;
