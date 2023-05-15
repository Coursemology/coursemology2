import { combineReducers } from '@reduxjs/toolkit';

import courseStatisticsReducer from './reducers/courseStatistics';
import staffStatisticsReducer from './reducers/staffStatistics';
import studentsStatisticsReducer from './reducers/studentsStatistics';

const reducer = combineReducers({
  courseStatistics: courseStatisticsReducer,
  staffStatistics: staffStatisticsReducer,
  studentsStatistics: studentsStatisticsReducer,
});

export default reducer;
