import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PlagiarismAssessments,
  PlagiarismAssessmentsState,
} from 'types/course/plagiarism';

const initialState: PlagiarismAssessmentsState = {
  assessments: [],
};

export const plagiarismAssessmentsSlice = createSlice({
  name: 'plagiarismAssessments',
  initialState,
  reducers: {
    updateAssessments: (
      state,
      action: PayloadAction<PlagiarismAssessments>,
    ) => {
      state.assessments = action.payload.assessments;
    },

    reset: () => {
      return initialState;
    },
  },
});

export const plagiarismAssessmentsActions = plagiarismAssessmentsSlice.actions;

export default plagiarismAssessmentsSlice.reducer;
