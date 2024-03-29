import { FC } from 'react';

import { fetchStaffStatistics } from 'course/statistics/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import StaffStatisticsTable from './StaffStatisticsTable';

const StaffStatistics: FC = () => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchStaffStatistics}>
      {(data) => <StaffStatisticsTable staffs={data.staff} />}
    </Preload>
  );
};

export default StaffStatistics;
