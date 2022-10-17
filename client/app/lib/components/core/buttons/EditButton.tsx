import { SyntheticEvent } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import CustomTooltip from 'lib/components/core/CustomTooltip';

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
    <IconButton
      onClick={onClick}
      color="inherit"
      {...props}
      data-testid="EditIconButton"
    >
      <Edit data-testid="EditIcon" />
    </IconButton>
  </CustomTooltip>
);

export default EditButton;
