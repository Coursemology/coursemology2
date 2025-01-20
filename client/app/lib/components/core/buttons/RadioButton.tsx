import { ReactNode } from 'react';
import { FormControlLabel, Radio, Typography } from '@mui/material';

import InfoLabel from '../InfoLabel';

interface RadioButtonProps {
  value: string;
  label: ReactNode;
  className?: string;
  description?: string | ReactNode;
  disabled?: boolean;
  disabledHint?: ReactNode;
}

/**
 * To be used within `<RadioGroup>` wrappers in forms.
 */
const RadioButton = (props: RadioButtonProps): JSX.Element => {
  return (
    <div className="w-full">
      <FormControlLabel
        className={props.className}
        control={<Radio className="px-4 py-0" />}
        disabled={props.disabled}
        label={props.label}
        value={props.value}
      />

      <div className="ml-[34px] space-y-2">
        {props.description && (
          <Typography
            color={props.disabled ? 'text.disabled' : 'text.secondary'}
            variant="body2"
          >
            {props.description}
          </Typography>
        )}

        {props.disabled && props.disabledHint && (
          <InfoLabel label={props.disabledHint} />
        )}
      </div>
    </div>
  );
};

export default RadioButton;
