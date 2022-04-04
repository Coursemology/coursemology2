import { combineReducers } from 'redux';
import courseStatistics from './courseStatistics';
import studentsStatistics from './studentsStatistics';
import staffStatistics from './staffStatistics';

export default combineReducers({
  courseStatistics,
  studentsStatistics,
  staffStatistics,
});
