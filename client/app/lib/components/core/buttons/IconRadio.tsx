import { createElement } from 'react';
import { Radio, SvgIcon, Typography } from '@mui/material';

interface IconRadioProps {
  value?: string;
  label?: string;
  description?: string;
  icon?: typeof SvgIcon;
  disabled?: boolean;
}

const IconRadio = (props: IconRadioProps): JSX.Element => (
  <label
    className={`flex cursor-pointer py-2 ${
      props.description ? 'items-start' : 'items-center'
    }`}
  >
    <Radio className="pl-0" disabled={props.disabled} value={props.value} />

    {props.icon &&
      createElement(props.icon, {
        fontSize: 'large',
        className: 'mx-4',
        color: props.disabled ? 'disabled' : undefined,
      })}

    <div>
      <Typography
        color={props.disabled ? 'text.disabled' : 'text.primary'}
        variant="body1"
      >
        {props.label}
      </Typography>

      {props.description && (
        <Typography
          color={props.disabled ? 'text.disabled' : 'text.secondary'}
          variant="body2"
        >
          {props.description}
        </Typography>
      )}
    </div>
  </label>
);

export default IconRadio;
