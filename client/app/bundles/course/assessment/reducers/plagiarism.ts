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
      lastRunAt: new Date().toISOString(),
    },
    submissionPairs: [],
  },
  // After the first query populates submissionPairs with the completed state,
  // subsequent queries should add to the list until a query returns with no more results.
  isAllSubmissionPairsLoaded: false,
};

export const plagiarismSlice = createSlice({
  name: 'plagiarism',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<AssessmentPlagiarism>) => {
      state.data = action.payload;
      state.isAllSubmissionPairsLoaded = false;
    },
    addSubmissionPairs: (
      state,
      action: PayloadAction<AssessmentPlagiarism>,
    ) => {
      state.data.submissionPairs.push(...action.payload.submissionPairs);
      state.isAllSubmissionPairsLoaded =
        action.payload.submissionPairs.length === 0;
    },
  },
});

export const plagiarismActions = plagiarismSlice.actions;

export default plagiarismSlice.reducer;
