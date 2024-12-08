import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import {
  AssessmentCategoryData,
  AssessmentProgrammingQuestionsData,
  AssessmentTabData,
  ProgrammingEvaluator,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

export const assessmentCategoriesAdapter =
  createEntityAdapter<AssessmentCategoryData>({});
export const assessmentTabsAdapter = createEntityAdapter<AssessmentTabData>({});
export const assessmentsAdapter =
  createEntityAdapter<AssessmentProgrammingQuestionsData>({});
export const programmingQuestionsAdapter =
  createEntityAdapter<ProgrammingQuestion>({});

export interface CodaveriSettingsPageViewSettings {
  showCodaveriEnabled: boolean;
  isAssessmentListExpanded: boolean;
}

export interface CodaveriSettingsState {
  assessmentCategories: EntityState<AssessmentCategoryData>;
  assessmentTabs: EntityState<AssessmentTabData>;
  assessments: EntityState<AssessmentProgrammingQuestionsData>;
  programmingQuestions: EntityState<ProgrammingQuestion>;
  viewSettings: CodaveriSettingsPageViewSettings;
}

const initialState: CodaveriSettingsState = {
  assessmentCategories: assessmentCategoriesAdapter.getInitialState(),
  assessmentTabs: assessmentTabsAdapter.getInitialState(),
  assessments: assessmentsAdapter.getInitialState(),
  programmingQuestions: programmingQuestionsAdapter.getInitialState(),
  viewSettings: {
    showCodaveriEnabled: false,
    isAssessmentListExpanded: false,
  },
};

export const codaveriSettingsSlice = createSlice({
  name: 'codaveriSettings',
  initialState,
  reducers: {
    saveAllAssessmentsQuestions: (
      state,
      action: PayloadAction<{
        categories: AssessmentCategoryData[];
        tabs: AssessmentTabData[];
        assessments: AssessmentProgrammingQuestionsData[];
      }>,
    ) => {
      const { categories, tabs, assessments } = action.payload;
      const questions = assessments.flatMap(
        (assessment) => assessment.programmingQuestions,
      );
      assessmentCategoriesAdapter.setAll(
        state.assessmentCategories,
        categories,
      );
      assessmentTabsAdapter.setAll(state.assessmentTabs, tabs);
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
    updateProgrammingQuestionCodaveriSettingsForAssessments: (
      state,
      action: PayloadAction<{
        evaluator: ProgrammingEvaluator;
        programmingQuestionIds: number[];
      }>,
    ) => {
      action.payload.programmingQuestionIds.forEach((qnId) => {
        const question = state.programmingQuestions.entities[qnId];
        if (question) {
          question.isCodaveri = action.payload.evaluator === 'codaveri';
        }
      });
    },
    updateProgrammingQuestionLiveFeedbackEnabledForAssessments: (
      state,
      action: PayloadAction<{
        liveFeedbackEnabled: boolean;
        programmingQuestionIds: number[];
      }>,
    ) => {
      action.payload.programmingQuestionIds.forEach((qnId) => {
        const question = state.programmingQuestions.entities[qnId];
        if (question) {
          question.liveFeedbackEnabled = action.payload.liveFeedbackEnabled;
        }
      });
    },
    updateCodaveriSettingsPageViewSettings: (
      state,
      action: PayloadAction<Partial<CodaveriSettingsPageViewSettings>>,
    ) => {
      state.viewSettings = { ...state.viewSettings, ...action.payload };
    },
  },
});

export const {
  saveAllAssessmentsQuestions,
  updateProgrammingQuestion,
  updateProgrammingQuestionCodaveriSettingsForAssessments,
  updateProgrammingQuestionLiveFeedbackEnabledForAssessments,
  updateCodaveriSettingsPageViewSettings,
} = codaveriSettingsSlice.actions;

export default codaveriSettingsSlice.reducer;
