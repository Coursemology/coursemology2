import { Button, useMediaQuery } from '@mui/material';

import AddButton from 'lib/components/core/buttons/AddButton';

interface WidthAdjustedNewButtonProps {
  minWidth: number;
  textButtonKey: string;
  nonTextButtonKey: string;
  textButtonClassName: string;
  nonTextButtonClassName: string;
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

const WidthAdjustedNewButton = (
  props: WidthAdjustedNewButtonProps,
): JSX.Element => {
  const minWidthForAddButtonWithText = useMediaQuery(
    `(min-width:${props.minWidth}px)`,
  );

  return minWidthForAddButtonWithText ? (
    <Button
      key={props.textButtonKey}
      className={props.textButtonClassName}
      disabled={props.disabled ?? false}
      onClick={props.onClick}
      variant="outlined"
    >
      {props.text}
    </Button>
  ) : (
    <AddButton
      key={props.nonTextButtonKey}
      className={props.nonTextButtonClassName}
      onClick={props.onClick}
      tooltip={props.text}
    />
  );
};

export default WidthAdjustedNewButton;
