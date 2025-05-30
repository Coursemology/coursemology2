import { FC } from 'react';

import { fetchCodaveriStatistics } from 'course/statistics/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import CodaveriStatisticsTable from './CodaveriStatisticsTable';

const CodaveriStatistics: FC = () => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchCodaveriStatistics}>
      {(data) => <CodaveriStatisticsTable liveFeedbacks={data.liveFeedbacks} />}
    </Preload>
  );
};

export default CodaveriStatistics;
