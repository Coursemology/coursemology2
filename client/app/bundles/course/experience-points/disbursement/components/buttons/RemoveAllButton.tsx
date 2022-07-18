import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { RemoveCircle } from '@mui/icons-material';

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
        onClick={onClick}
        color="error"
        {...props}
      >
        <RemoveCircle />
      </IconButton>
    </Tooltip>
  );
};

export default RemoveAllButton;
