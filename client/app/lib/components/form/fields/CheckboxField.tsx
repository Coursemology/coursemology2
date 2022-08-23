import { FC, memo } from 'react';
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
  checkboxContainer: {
    width: '100%',
  },
  field: {
    marginBottom: 0,
  },
  checkbox: {
    padding: '0 8px',
  },
  description: {
    marginLeft: '30px',
    marginTop: 0.5,
  },
  disabledHint: {
    marginLeft: '30px',
    marginTop: '0.5rem',
  },
};

const FormCheckboxField: FC<Props> = (props) => {
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
    ...custom
  } = props;
  const isError = !!fieldState.error;
  if (!renderIf) {
    return <></>;
  }

  return (
    <Box width="100%">
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            checked={field.value}
            color="primary"
            onChange={field.onChange}
            sx={styles.checkbox}
            icon={icon}
            checkedIcon={checkedIcon}
          />
        }
        disabled={disabled}
        label={label}
        sx={styles.field}
        {...custom}
      />

      {description ? (
        <Typography
          variant="body2"
          sx={styles.description}
          color={disabled ? 'text.disabled' : 'text.secondary'}
        >
          {description}
        </Typography>
      ) : null}

      {disabledHint && disabled ? (
        <div style={styles.disabledHint}>{disabledHint}</div>
      ) : null}

      {isError ? (
        <FormHelperText error={isError} sx={styles.description}>
          {formatErrorMessage(fieldState.error?.message)}
        </FormHelperText>
      ) : null}
    </Box>
  );
};

export default memo(FormCheckboxField, propsAreEqual);
