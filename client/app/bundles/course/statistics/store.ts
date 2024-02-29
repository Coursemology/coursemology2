import { combineReducers } from '@reduxjs/toolkit';

import coursePerformanceStatisticsReducer from './reducers/coursePerformanceStatistics';
import courseProgressionStatisticsReducer from './reducers/courseProgressionStatistics';
import staffStatisticsReducer from './reducers/staffStatistics';
import studentsStatisticsReducer from './reducers/studentsStatistics';

const reducer = combineReducers({
  coursePerformanceStatistics: coursePerformanceStatisticsReducer,
  courseProgressionStatistics: courseProgressionStatisticsReducer,
  staffStatistics: staffStatisticsReducer,
  studentsStatistics: studentsStatisticsReducer,
});

export default reducer;
