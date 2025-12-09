import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssessmentStatisticsState } from 'types/course/statistics/assessmentStatistics';

import { processSubmission } from '../pages/AssessmentStatistics/utils';

const initialState: AssessmentStatisticsState = {
  submissionStatistics: [],
  assessmentStatistics: null,
  liveFeedbackStatistics: [],
  ancestorInfo: [],
};

export const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setSubmissionStatistics: (
      state,
      action: PayloadAction<AssessmentStatisticsState['submissionStatistics']>,
    ) => {
      state.submissionStatistics = action.payload.map(processSubmission);
    },
    setAssessmentStatistics: (
      state,
      action: PayloadAction<AssessmentStatisticsState['assessmentStatistics']>,
    ) => {
      state.assessmentStatistics = action.payload;
    },
    setLiveFeedbackStatistics: (
      state,
      action: PayloadAction<
        AssessmentStatisticsState['liveFeedbackStatistics']
      >,
    ) => {
      state.liveFeedbackStatistics = action.payload;
    },
    setAncestorInfo: (
      state,
      action: PayloadAction<AssessmentStatisticsState['ancestorInfo']>,
    ) => {
      state.ancestorInfo = action.payload;
    },
    reset: () => {
      return initialState;
    },
  },
});

export const statisticsActions = statisticsSlice.actions;

export default statisticsSlice.reducer;
