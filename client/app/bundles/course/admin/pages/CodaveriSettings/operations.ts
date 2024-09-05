import { AxiosError } from 'axios';
import { dispatch } from 'store';
import {
  AssessmentProgrammingQuestionsData,
  CodaveriSettingsData,
  CodaveriSettingsEntity,
  CodaveriSettingsPatchData,
  ProgrammingEvaluator,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

import CourseAPI from 'api/course';
import { saveAllAssessmentsQuestions } from 'course/admin/reducers/codaveriSettings';

type Data = Promise<CodaveriSettingsEntity>;

const convertSettingsDataToEntity = (
  settings: CodaveriSettingsData,
): CodaveriSettingsEntity => ({
  ...settings,
  isOnlyITSP: settings.isOnlyITSP ? 'itsp' : 'default',
});

const convertEntityDataToPatchData = (
  data: CodaveriSettingsEntity,
): CodaveriSettingsPatchData => ({
  settings_codaveri_component: {
    feedback_workflow: data.feedbackWorkflow,
    is_only_itsp: data.isOnlyITSP === 'itsp',
  },
});

export const fetchCodaveriSettings = async (): Data => {
  try {
    const response = await CourseAPI.admin.codaveri.index();
    const data = convertSettingsDataToEntity(response.data);
    dispatch(
      saveAllAssessmentsQuestions({
        assessments: data.assessments,
        tabs: data.assessmentTabs,
        categories: data.assessmentCategories,
      }),
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchCodaveriSettingsForAssessment = async (
  assessmentId: number,
): Promise<{ assessments: AssessmentProgrammingQuestionsData[] }> => {
  try {
    const response = await CourseAPI.admin.codaveri.assessment(assessmentId);
    dispatch(
      saveAllAssessmentsQuestions({
        assessments: response.data.assessments,
        tabs: [],
        categories: [],
      }),
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateCodaveriSettings = async (
  data: CodaveriSettingsEntity,
): Data => {
  const adaptedData = convertEntityDataToPatchData(data);
  try {
    const response = await CourseAPI.admin.codaveri.update(adaptedData);
    return convertSettingsDataToEntity(response.data);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateProgrammingQuestionCodaveri = async (
  assessmentId: number,
  questionId: number,
  data: ProgrammingQuestion,
): Promise<void> => {
  const adaptedData = {
    question_programming: {
      is_codaveri: data.isCodaveri,
    },
  };
  try {
    await CourseAPI.assessment.question.programming.updateQnSetting(
      assessmentId,
      questionId,
      adaptedData,
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateProgrammingQuestionLiveFeedback = async (
  assessmentId: number,
  questionId: number,
  data: ProgrammingQuestion,
): Promise<void> => {
  const adaptedData = {
    question_programming: {
      live_feedback_enabled: data.liveFeedbackEnabled,
    },
  };
  try {
    await CourseAPI.assessment.question.programming.updateQnSetting(
      assessmentId,
      questionId,
      adaptedData,
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateEvaluatorForAllQuestions = async (
  assessmentIds: number[],
  evaluator: ProgrammingEvaluator,
): Promise<void> => {
  const adaptedData = {
    update_evaluator: {
      assessment_ids: assessmentIds,
      programming_evaluator: evaluator,
    },
  };
  try {
    await CourseAPI.admin.codaveri.updateEvaluatorForAllQuestions(adaptedData);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateLiveFeedbackEnabledForAllQuestions = async (
  assessmentIds: number[],
  liveFeedbackEnabled: boolean,
): Promise<void> => {
  const adaptedData = {
    update_live_feedback_enabled: {
      assessment_ids: assessmentIds,
      live_feedback_enabled: liveFeedbackEnabled,
    },
  };
  try {
    await CourseAPI.admin.codaveri.updateLiveFeedbackEnabledForAllQuestions(
      adaptedData,
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
