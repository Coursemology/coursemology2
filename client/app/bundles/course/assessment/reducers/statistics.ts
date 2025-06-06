import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssessmentStatisticsState } from 'types/course/statistics/assessmentStatistics';

import { processAssessment, processSubmission } from '../utils/statisticsUtils';

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
    initialize: (state, action: PayloadAction<AssessmentStatisticsState>) => {
      state.assessmentStatistics = processAssessment(
        action.payload.assessmentStatistics,
      );
      state.submissionStatistics =
        action.payload.submissionStatistics.map(processSubmission);
      state.liveFeedbackStatistics = action.payload.liveFeedbackStatistics;
      state.ancestorInfo = action.payload.ancestorInfo;
    },
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
