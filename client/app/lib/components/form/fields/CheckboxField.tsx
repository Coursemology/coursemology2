import { FC, memo } from 'react';
import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { ControllerFieldState } from 'react-hook-form';
import { formatErrorMessage } from './utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

interface Props {
  // react-hook-form ControllerRenderProps requires generics for field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  fieldState: ControllerFieldState;
  disabled?: boolean;
  label?: JSX.Element;
  renderIf?: boolean;
  icon?: JSX.Element;
  checkedIcon?: JSX.Element;
}

const styles = {
  checkboxContainer: {
    width: '100%',
  },
  checkbox: {
    margin: '-4px 0px 0px 0px',
    padding: '2px',
  },
  checkboxStyle: {
    marginLeft: '0px',
  },
  errorText: { margin: 0 },
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
    ...custom
  } = props;
  const isError = !!fieldState.error;
  if (!renderIf) {
    return <></>;
  }

  return (
    <div style={styles.checkboxContainer}>
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            checked={field.value}
            color="primary"
            onChange={field.onChange}
            style={styles.checkbox}
            icon={icon}
            checkedIcon={checkedIcon}
          />
        }
        disabled={disabled}
        label={<b>{label}</b>}
        labelPlacement="start"
        style={styles.checkboxStyle}
        {...custom}
      />
      {isError && (
        <FormHelperText error={isError} style={styles.errorText}>
          {formatErrorMessage(fieldState.error?.message)}
        </FormHelperText>
      )}
    </div>
  );
};

export default memo(FormCheckboxField, propsAreEqual);
