import { FC } from 'react';
import { Button, ButtonProps, IconButton, Tooltip } from '@mui/material';

const HeaderButton: FC<{
  color?: ButtonProps['color'];
  disabled?: boolean;
  icon: JSX.Element;
  title: string;
  type?: ButtonProps['type'];
  variant?: ButtonProps['variant'];
  onClick?: ButtonProps['onClick'];
}> = (props) => (
  <>
    <Button
      className="max-lg:!hidden whitespace-nowrap"
      color={props.color}
      disabled={props.disabled}
      onClick={props.onClick}
      size="small"
      startIcon={props.icon}
      type={props.type}
      variant={props.variant ?? 'outlined'}
    >
      {props.title}
    </Button>
    <Tooltip title={props.title}>
      {props.variant === 'contained' ? (
        <Button
          className="lg:!hidden px-0 min-w-16 [&_span]:m-0"
          color={props.color}
          disabled={props.disabled}
          onClick={props.onClick}
          startIcon={props.icon}
          type={props.type}
          variant="contained"
        />
      ) : (
        <IconButton
          className="lg:!hidden"
          color={props.color}
          disabled={props.disabled}
          onClick={props.onClick}
          type={props.type}
        >
          {props.icon}
        </IconButton>
      )}
    </Tooltip>
  </>
);

export default HeaderButton;
