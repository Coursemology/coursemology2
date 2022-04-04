import { combineReducers } from 'redux';

import courseStatistics from './courseStatistics';
import staffStatistics from './staffStatistics';
import studentsStatistics from './studentsStatistics';

export default combineReducers({
  courseStatistics,
  studentsStatistics,
  staffStatistics,
});
