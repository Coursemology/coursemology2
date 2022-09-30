import { memo } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Typography,
} from '@mui/material';
import { ControllerFieldState } from 'react-hook-form';

import { formatErrorMessage } from './utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

interface Props {
  // react-hook-form ControllerRenderProps requires generics for field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  fieldState: ControllerFieldState;
  disabled?: boolean;
  label?: string;
  renderIf?: boolean;
  icon?: JSX.Element;
  checkedIcon?: JSX.Element;
  description?: string;
  disabledHint?: string | JSX.Element;
}

const styles = {
  description: {
    marginLeft: '30px',
  },
  disabledHint: {
    marginLeft: '30px',
    marginTop: '0.5rem',
  },
};

const FormCheckboxField = (props: Props): JSX.Element => {
  const {
    field,
    fieldState,
    disabled,
    label,
    renderIf = true,
    icon,
    checkedIcon,
    description,
    disabledHint,
  } = props;

  const isError = !!fieldState.error;
  if (!renderIf) return <></>;

  return (
    <Box width="100%">
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            checked={field.value}
            color="primary"
            onChange={field.onChange}
            className="py-0 px-4"
            icon={icon}
            checkedIcon={checkedIcon}
          />
        }
        disabled={disabled}
        label={label}
        className="mb-0"
      />

      {description && (
        <Typography
          variant="body2"
          className="ml-[34px]"
          color={disabled ? 'text.disabled' : 'text.secondary'}
        >
          {description}
        </Typography>
      )}

      {disabledHint && disabled && (
        <div style={styles.disabledHint}>{disabledHint}</div>
      )}

      {isError && (
        <FormHelperText error={isError} sx={styles.description}>
          {formatErrorMessage(fieldState.error?.message)}
        </FormHelperText>
      )}
    </Box>
  );
};

export default memo(FormCheckboxField, propsAreEqual);
