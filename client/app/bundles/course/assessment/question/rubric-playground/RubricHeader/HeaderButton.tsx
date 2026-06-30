import { FC } from 'react';
import { Button, ButtonProps, IconButton, Tooltip } from '@mui/material';

const HeaderButton: FC<{
  color?: ButtonProps['color'];
  disabled?: boolean;
  form?: ButtonProps['form'];
  icon: JSX.Element;
  title: string;
  // When set, an explanatory tooltip is shown on the full-size button (useful when it is disabled).
  tooltip?: string;
  type?: ButtonProps['type'];
  variant?: ButtonProps['variant'];
  onClick?: ButtonProps['onClick'];
}> = (props) => {
  const button = (
    <Button
      className="max-lg:!hidden whitespace-nowrap"
      color={props.color}
      disabled={props.disabled}
      form={props.form}
      onClick={props.onClick}
      size="small"
      startIcon={props.icon}
      type={props.type}
      variant={props.variant ?? 'outlined'}
    >
      {props.title}
    </Button>
  );

  return (
    <>
      {props.tooltip ? (
        <Tooltip title={props.tooltip}>
          {/* span wrapper so the tooltip still shows when the button is disabled */}
          <span className="max-lg:!hidden">{button}</span>
        </Tooltip>
      ) : (
        button
      )}
      <Tooltip title={props.tooltip ?? props.title}>
        {props.variant === 'contained' ? (
          <Button
            className="lg:!hidden px-0 min-w-16 [&_span]:m-0"
            color={props.color}
            disabled={props.disabled}
            form={props.form}
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
            form={props.form}
            onClick={props.onClick}
            type={props.type}
          >
            {props.icon}
          </IconButton>
        )}
      </Tooltip>
    </>
  );
};

export default HeaderButton;
