import { FC } from 'react';

import { fetchGetHelpStatistics } from 'course/statistics/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import GetHelpStatisticsTable from './GetHelpStatisticsTable';

const GetHelpStatistics: FC = () => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchGetHelpStatistics}>
      {(data) => <GetHelpStatisticsTable liveFeedbacks={data.liveFeedbacks} />}
    </Preload>
  );
};

export default GetHelpStatistics;
