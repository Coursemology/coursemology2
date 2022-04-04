import AssessmentStatisticsAPI from './AssessmentStatistics';
import CourseStatisticsAPI from './CourseStatistics';
import UserStatisticsAPI from './UserStatistics';

const StatisticsAPI = {
  course: new CourseStatisticsAPI(),
  assessment: new AssessmentStatisticsAPI(),
  user: new UserStatisticsAPI(),
};

Object.freeze(StatisticsAPI);

export default StatisticsAPI;
