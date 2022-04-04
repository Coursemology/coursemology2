import { FC } from 'react';
import { CourseUserRoles } from 'types/course/courseUsers';

import LearningRateRecords from './LearningRateRecords';

interface UserStatisticsProps {
  userRole: CourseUserRoles;
}

const UserStatistics: FC<UserStatisticsProps> = (props) => {
  const { userRole } = props;
  return <section>{userRole === 'student' && <LearningRateRecords />}</section>;
};

export default UserStatistics;
