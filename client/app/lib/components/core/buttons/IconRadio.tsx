import { createElement } from 'react';
import { Radio, Typography, SvgIcon } from '@mui/material';

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
    <Radio value={props.value} className="pl-0" disabled={props.disabled} />

    {props.icon &&
      createElement(props.icon, {
        fontSize: 'large',
        className: 'mx-4',
        color: props.disabled ? 'disabled' : undefined,
      })}

    <div>
      <Typography
        variant="body1"
        color={props.disabled ? 'text.disabled' : 'text.primary'}
      >
        {props.label}
      </Typography>

      {props.description && (
        <Typography
          variant="body2"
          color={props.disabled ? 'text.disabled' : 'text.secondary'}
        >
          {props.description}
        </Typography>
      )}
    </div>
  </label>
);

export default IconRadio;
