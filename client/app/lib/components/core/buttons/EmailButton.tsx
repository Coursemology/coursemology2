import { SyntheticEvent } from 'react';
import Email from '@mui/icons-material/Email';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
}

const EmailButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => (
  <Tooltip title={tooltip}>
    <span>
      <IconButton color="inherit" onClick={onClick} {...props}>
        <Email />
      </IconButton>
    </span>
  </Tooltip>
);

export default EmailButton;
