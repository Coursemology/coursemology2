import { Typography, Box } from '@mui/material';
import {
  WarningAmber as WarningIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

interface InfoLabelProps {
  label?: string;
  warning?: boolean;
  marginTop?: number;
}

const InfoLabel = (props: InfoLabelProps): JSX.Element => {
  return (
    <Box
      className="flex items-center"
      marginTop={props.marginTop}
      color={props.warning ? 'warning.main' : 'text.secondary'}
    >
      {props.warning ? <WarningIcon /> : <InfoIcon />}

      <Typography variant="body2" className="ml-2">
        {props.label}
      </Typography>
    </Box>
  );
};

export default InfoLabel;
