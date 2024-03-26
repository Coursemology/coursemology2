import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssessmentStatisticsState } from 'types/course/statistics/assessmentStatistics';

import { processAssessment, processSubmission } from '../utils/statisticsUtils';

const initialState: AssessmentStatisticsState = {
  assessment: null,
  submissions: [],
  ancestors: [],
};

export const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<AssessmentStatisticsState>) => {
      state.assessment = processAssessment(action.payload.assessment);
      state.submissions = action.payload.submissions.map(processSubmission);
      state.ancestors = action.payload.ancestors;
    },
    reset: () => {
      return initialState;
    },
  },
});

export const statisticsActions = statisticsSlice.actions;

export default statisticsSlice.reducer;
