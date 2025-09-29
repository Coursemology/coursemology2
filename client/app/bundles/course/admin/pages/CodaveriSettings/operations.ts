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

export const convertSettingsDataToEntity = (
  settings: CodaveriSettingsData,
): CodaveriSettingsEntity => {
  const { adminSettings, ...baseSettings } = settings;
  const settingsEntity: CodaveriSettingsEntity = {
    ...baseSettings,
  };
  if (adminSettings) {
    settingsEntity.adminSettings = {
      useSystemPrompt: adminSettings.overrideSystemPrompt
        ? 'override'
        : 'default',
      model: adminSettings.model,
      systemPrompt: adminSettings.systemPrompt,
    };
  }
  return settingsEntity;
};

const convertEntityDataToPatchData = (
  data: CodaveriSettingsEntity,
): CodaveriSettingsPatchData => {
  const patchObject: CodaveriSettingsPatchData['settings_codaveri_component'] =
    {
      feedback_workflow: data.feedbackWorkflow,
    };
  if (data.adminSettings) {
    patchObject.model = data.adminSettings.model;
    if (data.adminSettings.systemPrompt?.length) {
      patchObject.system_prompt = data.adminSettings.systemPrompt;
    }
    patchObject.override_system_prompt =
      data.adminSettings.useSystemPrompt === 'override';
  }
  return {
    settings_codaveri_component: patchObject,
  };
};

export const fetchCodaveriSettings =
  async (): Promise<CodaveriSettingsData> => {
    try {
      const response = await CourseAPI.admin.codaveri.index();
      dispatch(
        saveAllAssessmentsQuestions({
          assessments: response.data.assessments,
          tabs: response.data.assessmentTabs,
          categories: response.data.assessmentCategories,
        }),
      );
      return response.data;
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
  programmingQuestionIds: number[],
  evaluator: ProgrammingEvaluator,
): Promise<void> => {
  const adaptedData = {
    update_evaluator: {
      programming_question_ids: programmingQuestionIds,
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
  programmingQuestionIds: number[],
  liveFeedbackEnabled: boolean,
): Promise<void> => {
  const adaptedData = {
    update_live_feedback_enabled: {
      programming_question_ids: programmingQuestionIds,
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
