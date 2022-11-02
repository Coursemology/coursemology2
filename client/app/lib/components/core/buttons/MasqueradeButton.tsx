import { SyntheticEvent } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import TheaterComedy from '@mui/icons-material/TheaterComedy';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
}

const MasqueradeButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => (
  <Tooltip title={tooltip}>
    <span>
      <IconButton onClick={onClick} color="inherit" {...props}>
        <TheaterComedy />
      </IconButton>
    </span>
  </Tooltip>
);

export default MasqueradeButton;
