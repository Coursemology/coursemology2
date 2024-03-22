import { FC } from 'react';
import { Typography } from '@mui/material';

import { fetchSubmissionTimeStatistics } from 'course/statistics/operations';
import { SubmissionTimeStatistics } from 'course/statistics/types';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

interface Props {
  studentId: number;
}

const SubmissionTimeTable: FC<Props> = (props) => {
  const { studentId } = props;
  const fetchSubmissionTime = (): Promise<SubmissionTimeStatistics> =>
    fetchSubmissionTimeStatistics(studentId);

  return (
    <Preload render={<LoadingIndicator />} while={fetchSubmissionTime}>
      {(data) => <Typography variant="h6">{data.name}</Typography>}
    </Preload>
  );
};

export default SubmissionTimeTable;
