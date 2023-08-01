import { ReactNode, useEffect, useState } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { CourseUserProgressData } from 'types/course/courses';

interface LevelRingProps {
  in: CourseUserProgressData;
  children?: ReactNode;
}

const LevelRing = (props: LevelRingProps): JSX.Element => {
  const { in: progress } = props;

  const [percentage, setPercentage] = useState<number>();

  /**
   * Programmatically set the percentage on load to trigger animation.
   */
  useEffect(() => {
    setPercentage(progress.nextLevelPercentage);
  }, [progress.nextLevelPercentage]);

  return (
    <div className="relative flex shrink-0 items-center justify-center wh-20">
      <div className="absolute wh-20">
        <CircularProgress
          className="absolute text-neutral-300"
          size="5rem"
          thickness={3}
          value={100}
          variant="determinate"
        />

        <CircularProgress
          className="absolute"
          size="5rem"
          style={{ scale: '-1 1' }}
          thickness={3}
          value={percentage ?? 0}
          variant="determinate"
        />
      </div>

      {props.children}

      <div className="absolute -bottom-3 rounded-lg bg-primary px-1.5 py-1">
        <Typography
          className="font-semibold leading-none text-white"
          variant="body2"
        >
          {progress.level}
        </Typography>
      </div>
    </div>
  );
};

export default LevelRing;
