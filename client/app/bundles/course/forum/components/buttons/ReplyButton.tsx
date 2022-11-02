import { SyntheticEvent } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import Reply from '@mui/icons-material/Reply';

interface Props extends IconButtonProps {
  handleClick: (e: SyntheticEvent) => void;
}

const ReplyButton = ({ handleClick, ...props }: Props): JSX.Element => (
  <IconButton onClick={handleClick} color="info" title="Reply" {...props}>
    <Reply />
  </IconButton>
);

export default ReplyButton;
