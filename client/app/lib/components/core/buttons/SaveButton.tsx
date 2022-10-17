import { SyntheticEvent } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import Save from '@mui/icons-material/Save';

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
    <IconButton
      onClick={onClick}
      color="inherit"
      disabled={disabled}
      {...props}
    >
      <Save />
    </IconButton>
  </Tooltip>
);

export default SaveButton;
