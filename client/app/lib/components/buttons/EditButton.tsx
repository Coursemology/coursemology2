import { IconButton, IconButtonProps } from '@mui/material';
import Edit from '@mui/icons-material/Edit';

interface Props extends IconButtonProps {
  onClick: (SyntheticEvent: any) => void;
}

const EditButton = ({ onClick, ...props }: Props): JSX.Element => (
  <IconButton onClick={onClick} color="inherit" {...props}>
    <Edit />
  </IconButton>
);

export default EditButton;
