import { SyntheticEvent } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import Done from '@mui/icons-material/Done';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
}

const AcceptButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => (
  <Tooltip title={tooltip}>
    <span>
      <IconButton onClick={onClick} color="inherit" {...props}>
        <Done />
      </IconButton>
    </span>
  </Tooltip>
);

export default AcceptButton;
