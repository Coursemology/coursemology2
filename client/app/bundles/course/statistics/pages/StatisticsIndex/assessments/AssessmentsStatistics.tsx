import { FC } from 'react';

import { fetchAssessmentsStatistics } from 'course/statistics/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import AssessmentsStatisticsTable from './AssessmentsStatisticsTable';

const AssessmentsStatistics: FC = () => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchAssessmentsStatistics}>
      {(data) => (
        <AssessmentsStatisticsTable
          assessments={data.assessments}
          numStudents={data.numStudents}
        />
      )}
    </Preload>
  );
};

export default AssessmentsStatistics;
