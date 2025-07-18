import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SimilarityAssessments,
  SimilarityAssessmentsState,
} from 'types/course/similarity';

const initialState: SimilarityAssessmentsState = {
  assessments: [],
};

export const similarityAssessmentsSlice = createSlice({
  name: 'similarityAssessments',
  initialState,
  reducers: {
    updateAssessments: (
      state,
      action: PayloadAction<SimilarityAssessments>,
    ) => {
      state.assessments = action.payload.assessments;
    },

    reset: () => {
      return initialState;
    },
  },
});

export const similarityAssessmentsActions = similarityAssessmentsSlice.actions;

export default similarityAssessmentsSlice.reducer;
