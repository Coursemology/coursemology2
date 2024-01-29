import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssessmentStatisticsStore } from 'types/course/statistics/assessmentStatistics';

import { processAssessment, processSubmission } from '../utils/statisticsUtils';

const initialState: AssessmentStatisticsStore = {
  assessment: null,
  allStudents: [],
  submissions: [],
  ancestors: [],
  isLoading: true,
};

export const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<AssessmentStatisticsStore>) => {
      state.assessment = processAssessment(action.payload.assessment);
      state.allStudents = action.payload.allStudents;
      state.submissions = action.payload.submissions.map(processSubmission);
      state.ancestors = action.payload.ancestors;
      state.isLoading = action.payload.isLoading;
    },
    reset: () => {
      return initialState;
    },
  },
});

export const statisticsActions = statisticsSlice.actions;

export default statisticsSlice.reducer;
