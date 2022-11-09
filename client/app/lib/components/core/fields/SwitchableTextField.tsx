import { ComponentProps, KeyboardEventHandler } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import TextField from 'lib/components/core/fields/TextField';

type SwitchableTextFieldProps = ComponentProps<typeof TextField> & {
  editable: boolean;
  textProps?: ComponentProps<typeof Typography>;
  onPressEnter?: () => void;
  onPressEscape?: () => void;
};

const SwitchableTextField = (props: SwitchableTextFieldProps): JSX.Element => {
  const {
    editable,
    textProps,
    onPressEnter,
    onPressEscape,
    ...textFieldProps
  } = props;

  const { typography } = useTheme();

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e): void => {
    if (onPressEnter && e.key === 'Enter') {
      e.preventDefault();
      onPressEnter();
    }

    if (onPressEscape && e.key === 'Escape') {
      e.preventDefault();
      onPressEscape();
    }
  };

  if (!editable)
    return (
      <Typography
        className={`break-all px-4 py-3 ${props.className}`}
        variant="body1"
        {...textProps}
      >
        {typeof props.value === 'string' || typeof props.value === 'number'
          ? props.value
          : undefined}
      </Typography>
    );

  return (
    <TextField
      autoFocus={true}
      hiddenLabel={true}
      onKeyDown={handleKeyDown}
      size="small"
      value={props.value}
      variant="filled"
      {...textFieldProps}
      InputProps={{
        ...textFieldProps.InputProps,
        componentsProps: {
          input: {
            className: 'px-4 py-3',
            ...(textProps?.variant && {
              style: {
                fontSize: typography[textProps.variant].fontSize,
              },
            }),
          },
        },
      }}
    />
  );
};

export default SwitchableTextField;
