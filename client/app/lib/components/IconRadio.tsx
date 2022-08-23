import { createElement, CSSProperties } from 'react';
import { Radio, Typography, SvgIcon } from '@mui/material';

interface IconRadioProps {
  value?: string;
  label?: string;
  description?: string;
  icon?: typeof SvgIcon;
  disabled?: boolean;
}

const styles: { [key: string]: CSSProperties } = {
  icon: {
    marginLeft: 1,
    marginRight: 1,
  },
  radio: {
    paddingLeft: 0,
  },
  container: {
    padding: '0.5rem 0',
    cursor: 'pointer',
    display: 'flex',
  },
};

const IconRadio = (props: IconRadioProps): JSX.Element => {
  return (
    <label
      style={{
        ...styles.container,
        alignItems: props.description ? 'flex-start' : 'center',
      }}
    >
      <Radio value={props.value} sx={styles.radio} disabled={props.disabled} />

      {props.icon
        ? createElement(props.icon, {
            fontSize: 'large',
            sx: styles.icon,
            color: props.disabled ? 'disabled' : undefined,
          })
        : null}

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
};

export default IconRadio;
