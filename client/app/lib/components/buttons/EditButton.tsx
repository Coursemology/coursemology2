import { SyntheticEvent } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import Edit from '@mui/icons-material/Edit';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
}

const EditButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => (
  <Tooltip title={tooltip}>
    <span>
      <IconButton onClick={onClick} color="inherit" {...props}>
        <Edit />
      </IconButton>
    </span>
  </Tooltip>
);

export default EditButton;
