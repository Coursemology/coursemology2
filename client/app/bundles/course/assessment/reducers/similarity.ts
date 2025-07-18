import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AssessmentSimilarity,
  AssessmentSimilarityState,
  AssessmentSimilarityStatus,
} from 'types/course/similarity';

import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

const initialState: AssessmentSimilarityState = {
  data: {
    status: {
      workflowState: ASSESSMENT_SIMILARITY_WORKFLOW_STATE.not_started,
      lastRunAt: new Date(),
    },
    submissionPairs: [],
  },
};

export const similaritySlice = createSlice({
  name: 'similarity',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<AssessmentSimilarity>) => {
      state.data = action.payload;
    },
    runSimilarityCheckSuccess: (
      state,
      action: PayloadAction<AssessmentSimilarityStatus>,
    ) => {
      state.data.status = action.payload;
    },
    pollSimilarityJobFinished: (
      state,
      action: PayloadAction<AssessmentSimilarity>,
    ) => {
      state.data = action.payload;
    },
    reset: () => {
      return initialState;
    },
  },
});

export const similarityActions = similaritySlice.actions;

export default similaritySlice.reducer;
