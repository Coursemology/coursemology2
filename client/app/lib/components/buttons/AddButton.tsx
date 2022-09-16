import { IconButton, IconButtonProps } from '@mui/material';
import { AddBoxOutlined } from '@mui/icons-material';
import CustomTooltip from '../CustomTooltip';

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
    <CustomTooltip title={tooltip}>
      <IconButton onClick={onClick} {...props}>
        <AddBoxOutlined />
      </IconButton>
    </CustomTooltip>
  );
};

export default DeleteButton;
