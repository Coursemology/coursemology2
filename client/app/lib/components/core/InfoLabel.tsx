import { ReactNode } from 'react';
import {
  InfoOutlined as InfoIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

interface InfoLabelProps {
  label?: ReactNode;
  warning?: boolean;
  marginTop?: number;
}

const InfoLabel = (props: InfoLabelProps): JSX.Element => {
  return (
    <Box
      className="flex items-center"
      color={props.warning ? 'warning.main' : 'text.secondary'}
      marginTop={props.marginTop}
    >
      {props.warning ? <WarningIcon /> : <InfoIcon />}

      <Typography className="ml-2" variant="body2">
        {props.label}
      </Typography>
    </Box>
  );
};

export default InfoLabel;
