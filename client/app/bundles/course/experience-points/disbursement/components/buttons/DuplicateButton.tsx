import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface Props extends IconButtonProps {
  disabled: boolean;
  onClick: () => void;
  title: string;
  className?: string;
}

const DuplicateButton = ({
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
        color="inherit"
        onClick={onClick}
        {...props}
      >
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
  );
};

export default DuplicateButton;
