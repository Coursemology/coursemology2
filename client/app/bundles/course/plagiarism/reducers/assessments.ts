import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PlagiarismAssessments,
  PlagiarismAssessmentsState,
} from 'types/course/plagiarism';

import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

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

    updateAssessmentWorkflowState: (
      state,
      action: PayloadAction<{
        assessmentId: number;
        workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE;
      }>,
    ) => {
      const assessment = state.assessments.find(
        (a) => a.id === action.payload.assessmentId,
      );
      if (assessment) {
        assessment.workflowState = action.payload.workflowState;
      }
    },

    reset: () => {
      return initialState;
    },
  },
});

export const plagiarismAssessmentsActions = plagiarismAssessmentsSlice.actions;

export default plagiarismAssessmentsSlice.reducer;
