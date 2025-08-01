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

    updateNumLinkedAssessments: (
      state,
      action: PayloadAction<{
        assessmentId: number;
        numLinkedAssessments: number;
      }>,
    ) => {
      const assessment = state.assessments.find(
        (a) => a.id === action.payload.assessmentId,
      );
      if (assessment) {
        assessment.numLinkedAssessments = action.payload.numLinkedAssessments;
      }
    },

    reset: () => {
      return initialState;
    },
  },
});

export const plagiarismAssessmentsActions = plagiarismAssessmentsSlice.actions;

export default plagiarismAssessmentsSlice.reducer;
