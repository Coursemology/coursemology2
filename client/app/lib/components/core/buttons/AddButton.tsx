import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface AddButtonProps extends IconButtonProps {
  onClick: () => void;
  tooltip?: string;
}

const AddButton = (props: AddButtonProps): JSX.Element => {
  const { tooltip, ...otherProps } = props;
  const button = (
    <IconButton color="inherit" {...otherProps}>
      <AddBoxOutlined />
    </IconButton>
  );

  if (!tooltip) return button;

  return (
    <Tooltip title={tooltip}>
      <span>{button}</span>
    </Tooltip>
  );
};

export default AddButton;
