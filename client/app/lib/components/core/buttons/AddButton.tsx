import { Add } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';

import useMedia from 'lib/hooks/useMedia';

interface AddButtonProps {
  onClick?: () => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  children?: string;

  /**
   * If `true`, the button will always be a text button.
   */
  fixed?: boolean;
}

/**
 * Displays an icon and tooltip on narrow screens and a text button on wide screens.
 * Defaults to the latter if `fixed` is `true`.
 */
const AddButton = (props: AddButtonProps): JSX.Element => {
  const wideScreen = useMedia.MaxWidth('md');

  return props.fixed || wideScreen ? (
    <Button
      aria-label={props.children}
      className={props.className}
      disabled={props.disabled}
      id={props.id}
      onClick={props.onClick}
      variant="outlined"
    >
      {props.children}
    </Button>
  ) : (
    <Tooltip disableInteractive title={props.children}>
      <IconButton
        aria-label={props.children}
        className={props.className}
        color="primary"
        id={props.id}
        onClick={props.onClick}
      >
        <Add />
      </IconButton>
    </Tooltip>
  );
};

export default AddButton;
