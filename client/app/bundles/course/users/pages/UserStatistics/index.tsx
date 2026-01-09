import { FC } from 'react';
import { CourseUserRole } from 'types/course/courseUsers';

import LearningRateRecords from './LearningRateRecords';

interface UserStatisticsProps {
  userRole: CourseUserRole;
}

const UserStatistics: FC<UserStatisticsProps> = (props) => {
  const { userRole } = props;
  return <section>{userRole === 'student' && <LearningRateRecords />}</section>;
};

export default UserStatistics;
