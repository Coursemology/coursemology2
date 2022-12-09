import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface AddButtonProps extends IconButtonProps {
  onClick: () => void;
  tooltip?: string;
}

const AddButton = (props: AddButtonProps): JSX.Element => {
  const button = (
    <IconButton color="inherit" {...props}>
      <AddBoxOutlined />
    </IconButton>
  );

  if (!props.tooltip) return button;

  return (
    <Tooltip title={props.tooltip}>
      <span>{button}</span>
    </Tooltip>
  );
};

export default AddButton;
