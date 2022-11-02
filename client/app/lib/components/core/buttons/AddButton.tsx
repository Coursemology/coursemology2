import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { AddBoxOutlined } from '@mui/icons-material';

interface Props extends IconButtonProps {
  onClick: () => void;
  tooltip?: string;
}

const DeleteButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => {
  return (
    <Tooltip title={tooltip}>
      <span>
        <IconButton color="inherit" onClick={onClick} {...props}>
          <AddBoxOutlined />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default DeleteButton;
