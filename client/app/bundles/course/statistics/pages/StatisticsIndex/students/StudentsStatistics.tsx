import { FC } from 'react';

import { fetchStudentStatistics } from 'course/statistics/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import StatisticsTabs from '../StatisticsTabs';

import StudentsStatisticsTable from './StudentStatisticsTable';

const StudentsStatistics: FC = () => {
  return (
    <>
      <StatisticsTabs />
      <Preload render={<LoadingIndicator />} while={fetchStudentStatistics}>
        {(data) => (
          <StudentsStatisticsTable
            metadata={data.metadata}
            students={data.students}
          />
        )}
      </Preload>
    </>
  );
};

export default StudentsStatistics;
