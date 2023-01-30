import { FC } from 'react';
import { LinearProgress, Typography } from '@mui/material';

interface Props {
  /**
   * Value between 0 and 100.
   */
  value: number;
}

const LinearProgressWithLabel: FC<Props> = (props: Props) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-full">
        <LinearProgress value={props.value ?? 0} variant="determinate" />
      </div>
      <div className="min-w-[4rem]">
        <Typography color="text.secondary" variant="body2">{`${Math.round(
          props.value ?? 0,
        )}%`}</Typography>
      </div>
    </div>
  );
};

export default LinearProgressWithLabel;
