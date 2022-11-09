import { SyntheticEvent } from 'react';
import Save from '@mui/icons-material/Save';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
  disabled?: boolean;
}

const SaveButton = ({
  onClick,
  tooltip = '',
  disabled = false,
  ...props
}: Props): JSX.Element => (
  <Tooltip title={tooltip}>
    <span>
      <IconButton
        color="inherit"
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        <Save />
      </IconButton>
    </span>
  </Tooltip>
);

export default SaveButton;
