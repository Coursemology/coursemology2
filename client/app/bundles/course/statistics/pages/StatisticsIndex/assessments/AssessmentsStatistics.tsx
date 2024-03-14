import { FC } from 'react';
import { Typography } from '@mui/material';

import { fetchAssessmentsStatistics } from 'course/statistics/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

const AssessmentsStatistics: FC = () => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchAssessmentsStatistics}>
      {(data) => {
        // eslint-disable-next-line no-console
        console.log(data);
        return (
          <Typography className="ml-2 mt-2" variant="h6">
            Still under construction
          </Typography>
        );
      }}
    </Preload>
  );
};

export default AssessmentsStatistics;
