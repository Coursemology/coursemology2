import { SyntheticEvent } from 'react';
import Reply from '@mui/icons-material/Reply';
import { IconButton, IconButtonProps } from '@mui/material';

interface Props extends IconButtonProps {
  handleClick: (e: SyntheticEvent) => void;
}

const ReplyButton = ({ handleClick, ...props }: Props): JSX.Element => (
  <IconButton color="info" onClick={handleClick} title="Reply" {...props}>
    <Reply />
  </IconButton>
);

export default ReplyButton;
