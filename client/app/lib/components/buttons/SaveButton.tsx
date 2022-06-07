import { IconButton, IconButtonProps } from '@mui/material';
import Save from '@mui/icons-material/Save';

interface Props extends IconButtonProps {
  onClick: (SyntheticEvent: any) => void;
}

const SaveButton = ({ onClick, ...props }: Props): JSX.Element => (
  <IconButton onClick={onClick} color="inherit" {...props}>
    <Save />
  </IconButton>
);

export default SaveButton;
