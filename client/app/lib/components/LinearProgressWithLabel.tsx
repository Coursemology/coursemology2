import { FC } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface Props {
  /**
   * Value between 0 and 100.
   */
  value: number;
}

const LinearProgressWithLabel: FC<Props> = (props: Props) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value ?? 0,
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

export default LinearProgressWithLabel;
