import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import {
  AssessmentProgrammingQuestionsData,
  ProgrammingEvaluator,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

export const assessmentsAdapter =
  createEntityAdapter<AssessmentProgrammingQuestionsData>({});
export const programmingQuestionsAdapter =
  createEntityAdapter<ProgrammingQuestion>({});

export interface CodaveriSettingsState {
  assessments: EntityState<AssessmentProgrammingQuestionsData>;
  programmingQuestions: EntityState<ProgrammingQuestion>;
}

const initialState: CodaveriSettingsState = {
  assessments: assessmentsAdapter.getInitialState(),
  programmingQuestions: programmingQuestionsAdapter.getInitialState(),
};

export const codaveriSettingsSlice = createSlice({
  name: 'codaveriSettings',
  initialState,
  reducers: {
    saveAllAssessmentsQuestions: (
      state,
      action: PayloadAction<AssessmentProgrammingQuestionsData[]>,
    ) => {
      const assessments = action.payload;
      const questions = assessments.flatMap(
        (assessment) => assessment.programmingQuestions,
      );

      assessmentsAdapter.setAll(state.assessments, assessments);
      programmingQuestionsAdapter.setAll(state.programmingQuestions, questions);
    },
    updateProgrammingQuestion: (
      state,
      action: PayloadAction<ProgrammingQuestion>,
    ) => {
      const updatedData = { id: action.payload.id, changes: action.payload };
      programmingQuestionsAdapter.updateOne(
        state.programmingQuestions,
        updatedData,
      );
    },
    updateAllProgrammingQuestionCodaveriSettings: (
      state,
      action: PayloadAction<{
        evaluator: ProgrammingEvaluator;
      }>,
    ) => {
      state.programmingQuestions.ids.forEach((qnId) => {
        const question = state.programmingQuestions.entities[qnId];
        if (question) {
          question.isCodaveri = action.payload.evaluator === 'codaveri';
        }
      });
    },
  },
});

export const {
  saveAllAssessmentsQuestions,
  updateProgrammingQuestion,
  updateAllProgrammingQuestionCodaveriSettings,
} = codaveriSettingsSlice.actions;

export default codaveriSettingsSlice.reducer;
