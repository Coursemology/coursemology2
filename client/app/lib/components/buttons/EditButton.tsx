import { SyntheticEvent } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import CustomTooltip from '../CustomTooltip';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
}

const EditButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => (
  <CustomTooltip title={tooltip}>
    <span>
      <IconButton
        onClick={onClick}
        color="inherit"
        {...props}
        data-testid="EditIconButton"
      >
        <Edit data-testid="EditIcon" />
      </IconButton>
    </span>
  </CustomTooltip>
);

export default EditButton;
