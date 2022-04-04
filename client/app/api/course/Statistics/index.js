import CourseStatisticsAPI from './CourseStatistics';

const StatisticsAPI = {
  course: new CourseStatisticsAPI(),
};

Object.freeze(StatisticsAPI);

export default StatisticsAPI;
