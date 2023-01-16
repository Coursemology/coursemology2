import { SyntheticEvent } from 'react';
import Reply from '@mui/icons-material/Reply';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface Props extends IconButtonProps {
  handleClick: (e: SyntheticEvent) => void;
}

const ReplyButton = ({ handleClick, ...props }: Props): JSX.Element => (
  <Tooltip title="Reply">
    <span>
      <IconButton color="info" onClick={handleClick} {...props}>
        <Reply />
      </IconButton>
    </span>
  </Tooltip>
);

export default ReplyButton;
