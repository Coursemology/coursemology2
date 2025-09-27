import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PlagiarismAssessmentListData,
  PlagiarismAssessmentsState,
  PlagiarismCheck,
} from 'types/course/plagiarism';

const initialState: PlagiarismAssessmentsState = {
  assessments: {},
};

export const plagiarismAssessmentsSlice = createSlice({
  name: 'plagiarismAssessments',
  initialState,
  reducers: {
    updateAssessments: (
      state,
      action: PayloadAction<PlagiarismAssessmentListData[]>,
    ) => {
      state.assessments = action.payload.reduce((acc, assessment) => {
        acc[assessment.id] = assessment;
        return acc;
      }, {});
    },

    updatePlagiarismChecks: (
      state,
      action: PayloadAction<PlagiarismCheck[]>,
    ) => {
      action.payload.forEach((plagiarismCheck) => {
        if (state.assessments[plagiarismCheck.assessmentId]) {
          state.assessments[plagiarismCheck.assessmentId].plagiarismCheck =
            plagiarismCheck;
        }
      });
    },

    updateNumLinkedAssessments: (
      state,
      action: PayloadAction<{
        assessmentId: number;
        numLinkedAssessments: number;
      }>,
    ) => {
      const assessment = state.assessments[action.payload.assessmentId];
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
