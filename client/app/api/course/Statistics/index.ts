import AnswerStatisticsAPI from './AnswerStatistics';
import AssessmentStatisticsAPI from './AssessmentStatistics';
import CourseStatisticsAPI from './CourseStatistics';
import UserStatisticsAPI from './UserStatistics';

const StatisticsAPI = {
  assessment: new AssessmentStatisticsAPI(),
  answer: new AnswerStatisticsAPI(),
  course: new CourseStatisticsAPI(),
  user: new UserStatisticsAPI(),
};

Object.freeze(StatisticsAPI);

export default StatisticsAPI;
