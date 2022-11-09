import { RemoveCircle } from '@mui/icons-material';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface Props extends IconButtonProps {
  disabled: boolean;
  onClick: () => void;
  title: string;
  className?: string;
}

const RemoveAllButton = ({
  disabled,
  onClick,
  title,
  className,
  ...props
}: Props): JSX.Element => {
  return (
    <Tooltip placement="top" title={title}>
      <IconButton
        className={className}
        color="error"
        onClick={onClick}
        {...props}
      >
        <RemoveCircle />
      </IconButton>
    </Tooltip>
  );
};

export default RemoveAllButton;
