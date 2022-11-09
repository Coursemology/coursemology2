import { SyntheticEvent } from 'react';
import TheaterComedy from '@mui/icons-material/TheaterComedy';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

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
      <IconButton color="inherit" onClick={onClick} {...props}>
        <TheaterComedy />
      </IconButton>
    </span>
  </Tooltip>
);

export default MasqueradeButton;
