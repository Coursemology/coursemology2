import CourseStatisticsAPI from './CourseStatistics';
import UserStatisticsAPI from './UserStatistics';

const StatisticsAPI = {
  course: new CourseStatisticsAPI(),
  user: new UserStatisticsAPI(),
};

Object.freeze(StatisticsAPI);

export default StatisticsAPI;
