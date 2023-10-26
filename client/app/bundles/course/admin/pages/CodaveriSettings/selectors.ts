import { EntityId } from '@reduxjs/toolkit';
import { AppState } from 'store';
import {
  AssessmentProgrammingQuestionsData,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

import {
  assessmentsAdapter,
  programmingQuestionsAdapter,
} from 'course/admin/reducers/codaveriSettings';

const assessmentSelector = assessmentsAdapter.getSelectors<AppState>(
  (state) => state.courseSettings.codaveriSettings.assessments,
);

const programmingQuestionsSelector =
  programmingQuestionsAdapter.getSelectors<AppState>(
    (state) => state.courseSettings.codaveriSettings.programmingQuestions,
  );

export const getAllAssessments = (
  state: AppState,
): AssessmentProgrammingQuestionsData[] => {
  return assessmentSelector.selectAll(state);
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
  return programmingQuestionsSelector.selectById(state, id);
};
