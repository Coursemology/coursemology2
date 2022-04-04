import AssessmentStatisticsAPI from './AssessmentStatistics';
import CourseStatisticsAPI from './CourseStatistics';

const StatisticsAPI = {
  course: new CourseStatisticsAPI(),
  assessment: new AssessmentStatisticsAPI(),
};

Object.freeze(StatisticsAPI);

export default StatisticsAPI;
