import { FormControlLabel, Radio, Typography } from '@mui/material';

interface RadioButtonProps {
  value: string;
  label: string;
  className?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * To be used within `<RadioGroup>` wrappers in forms.
 */
const RadioButton = (props: RadioButtonProps): JSX.Element => {
  return (
    <div className="w-full">
      <FormControlLabel
        className={props.className}
        control={<Radio className="py-0 px-4" />}
        disabled={props.disabled}
        label={props.label}
        value={props.value}
      />

      {props.description && (
        <Typography
          className="ml-[34px]"
          color={props.disabled ? 'text.disabled' : 'text.secondary'}
          variant="body2"
        >
          {props.description}
        </Typography>
      )}
    </div>
  );
};

export default RadioButton;
