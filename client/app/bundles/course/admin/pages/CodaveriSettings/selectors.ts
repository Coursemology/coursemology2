import { createSelector, EntityId } from '@reduxjs/toolkit';
import { AppState } from 'store';
import {
  AssessmentCategoryData,
  AssessmentProgrammingQuestionsData,
  AssessmentTabData,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

import {
  assessmentCategoriesAdapter,
  assessmentsAdapter,
  assessmentTabsAdapter,
  CodaveriSettingsState,
  programmingQuestionsAdapter,
} from 'course/admin/reducers/codaveriSettings';

const selectCodaveriSettingsStore = (state: AppState): CodaveriSettingsState =>
  state.courseSettings.codaveriSettings;

const assessmentCategorySelector =
  assessmentCategoriesAdapter.getSelectors<AppState>(
    (state) => state.courseSettings.codaveriSettings.assessmentCategories,
  );

const assessmentTabSelector = assessmentTabsAdapter.getSelectors<AppState>(
  (state) => state.courseSettings.codaveriSettings.assessmentTabs,
);

const assessmentSelector = assessmentsAdapter.getSelectors<AppState>(
  (state) => state.courseSettings.codaveriSettings.assessments,
);

const programmingQuestionsSelector =
  programmingQuestionsAdapter.getSelectors<AppState>(
    (state) => state.courseSettings.codaveriSettings.programmingQuestions,
  );

export const getAllAssessmentCategories = (
  state: AppState,
): AssessmentCategoryData[] => {
  return assessmentCategorySelector.selectAll(state);
};

export const getAllAssessmentTabs = (state: AppState): AssessmentTabData[] => {
  return assessmentTabSelector.selectAll(state);
};

export const getAllAssessmentTabsFor = (
  state: AppState,
  categoryId: EntityId,
): AssessmentTabData[] => {
  const assessmentTabs = getAllAssessmentTabs(state);
  return assessmentTabs.filter((tab) => tab.categoryId === categoryId);
};

export const getAllAssessments = (
  state: AppState,
): AssessmentProgrammingQuestionsData[] => {
  return assessmentSelector.selectAll(state);
};

export const getAssessment = (
  state: AppState,
  assessmentId: EntityId,
): AssessmentProgrammingQuestionsData | undefined => {
  return assessmentSelector.selectById(state, +assessmentId);
};

export const getAssessments = (
  state: AppState,
  assessmentIds: EntityId[],
): AssessmentProgrammingQuestionsData[] => {
  return assessmentIds.reduce<AssessmentProgrammingQuestionsData[]>(
    (assessmentArr, id) => {
      const assessment = getAssessment(state, id);
      if (assessment) assessmentArr.push(assessment);
      return assessmentArr;
    },
    [],
  );
};

export const getAssessmentsFor = (
  state: AppState,
  tabId: EntityId,
): AssessmentProgrammingQuestionsData[] => {
  const assessments = getAllAssessments(state);
  return assessments.filter((assessment) => assessment.tabId === tabId);
};

export const getAllProgrammingQuestions = (
  state: AppState,
): ProgrammingQuestion[] => {
  return programmingQuestionsSelector.selectAll(state);
};

export const getProgrammingQuestion = (
  state: AppState,
  id: EntityId,
): ProgrammingQuestion | undefined => {
  return programmingQuestionsSelector.selectById(state, +id);
};

export const getProgrammingQuestions = (
  state: AppState,
  questionIds: EntityId[],
): ProgrammingQuestion[] => {
  return questionIds.reduce<ProgrammingQuestion[]>((questionArr, id) => {
    const question = getProgrammingQuestion(state, id);
    if (question) questionArr.push(question);
    return questionArr;
  }, []);
};

export const getProgrammingQuestionsForAssessments = (
  state: AppState,
  assessmentIds: number[],
): ProgrammingQuestion[] => {
  const assessments = getAssessments(state, assessmentIds);
  const questionIds = assessments.flatMap(
    (assessment) => assessment.programmingQuestions.map((qn) => qn.id) || [],
  );
  return getProgrammingQuestions(state, questionIds);
};

export const getViewSettings = createSelector(
  selectCodaveriSettingsStore,
  (codaveriSettingsStore) => codaveriSettingsStore.viewSettings,
);
