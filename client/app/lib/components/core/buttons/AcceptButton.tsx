import { SyntheticEvent } from 'react';
import Done from '@mui/icons-material/Done';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

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
      <IconButton color="inherit" onClick={onClick} {...props}>
        <Done />
      </IconButton>
    </span>
  </Tooltip>
);

export default AcceptButton;
