import { SyntheticEvent } from 'react';
import Edit from '@mui/icons-material/Edit';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
}

const EditButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => (
  <Tooltip title="Edit">
    <span>
      <IconButton
        color="inherit"
        onClick={onClick}
        {...props}
        data-testid="EditIconButton"
      >
        <Edit data-testid="EditIcon" />
      </IconButton>
    </span>
  </Tooltip>
);

export default EditButton;
