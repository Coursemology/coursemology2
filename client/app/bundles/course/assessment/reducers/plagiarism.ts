import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AssessmentPlagiarism,
  AssessmentPlagiarismState,
  AssessmentPlagiarismStatus,
} from 'types/course/plagiarism';

import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

const initialState: AssessmentPlagiarismState = {
  data: {
    status: {
      workflowState: ASSESSMENT_SIMILARITY_WORKFLOW_STATE.not_started,
      lastRunAt: new Date(),
    },
    submissionPairs: [],
  },
};

export const plagiarismSlice = createSlice({
  name: 'plagiarism',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<AssessmentPlagiarism>) => {
      state.data = action.payload;
    },
    runPlagiarismCheckSuccess: (
      state,
      action: PayloadAction<AssessmentPlagiarismStatus>,
    ) => {
      state.data.status = action.payload;
    },
    pollPlagiarismJobFinished: (
      state,
      action: PayloadAction<AssessmentPlagiarism>,
    ) => {
      state.data = action.payload;
    },
    reset: () => {
      return initialState;
    },
  },
});

export const plagiarismActions = plagiarismSlice.actions;

export default plagiarismSlice.reducer;
