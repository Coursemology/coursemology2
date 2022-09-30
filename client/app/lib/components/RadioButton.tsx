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
        control={<Radio className="py-0 px-4" />}
        value={props.value}
        label={props.label}
        className={props.className}
        disabled={props.disabled}
      />

      {props.description && (
        <Typography
          variant="body2"
          color={props.disabled ? 'text.disabled' : 'text.secondary'}
          className="ml-[34px]"
        >
          {props.description}
        </Typography>
      )}
    </div>
  );
};

export default RadioButton;
