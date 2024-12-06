/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from 'axios';
import { Operation } from 'store';
import {
  AssessmentDeleteResult,
  AssessmentsListData,
  AssessmentUnlockRequirements,
  FetchAssessmentData,
} from 'types/course/assessment/assessments';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';
import { saveAllAssessmentsQuestions } from 'course/admin/reducers/codaveriSettings';
import { setNotification } from 'lib/actions';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';

import actionTypes from '../constants';

export const fetchAssessments = async (
  categoryId?: number,
  tabId?: number,
): Promise<AssessmentsListData> => {
  const response = await CourseAPI.assessment.assessments.index(
    categoryId,
    tabId,
  );

  return response.data;
};

export const fetchAssessment = async (
  id: number,
): Promise<FetchAssessmentData> => {
  const response = await CourseAPI.assessment.assessments.fetch(id);
  return response.data;
};

export const fetchAssessmentUnlockRequirements = async (
  id: number,
): Promise<AssessmentUnlockRequirements> => {
  const response =
    await CourseAPI.assessment.assessments.fetchUnlockRequirements(id);
  return response.data;
};

export const fetchAssessmentEditData = async (
  assessmentId: number,
): Promise<any> => {
  const response =
    await CourseAPI.assessment.assessments.fetchEditData(assessmentId);

  return response.data;
};

export const fetchAssessmentLiveFeedbackSettings = (
  assessmentId: number,
): Operation => {
  return async (dispatch) => {
    return CourseAPI.assessment.assessments
      .liveFeedbackSettings(assessmentId)
      .then((response) => {
        dispatch(
          saveAllAssessmentsQuestions({
            assessments: response.data.assessments,
          }),
        );
      })
      .catch((error) => {
        if (error instanceof AxiosError) throw error.response?.data?.errors;
        throw error;
      });
  };
};

export const updateLiveFeedbackForAllQuestionsInAssessment = async (
  assessmentId: number,
  liveFeedbackEnabled: boolean,
): Promise<void> => {
  const adaptedData = {
    live_feedback_settings: {
      enabled: liveFeedbackEnabled,
    },
  };
  try {
    await CourseAPI.assessment.assessments.updateLiveFeedbackSettings(
      assessmentId,
      adaptedData,
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const createAssessment = (
  categoryId: number,
  tabId: number,
  data,
  successMessage: string,
  failureMessage: string,
  setError,
  onSuccess: (url: string) => void,
): Operation => {
  const attributes = { ...data, category: categoryId, tab: tabId };
  return async (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments
      .create(attributes)
      .then((response) => {
        dispatch({ type: actionTypes.CREATE_ASSESSMENT_SUCCESS });
        dispatch(setNotification(successMessage));

        setTimeout(() => {
          if (response?.data?.id)
            onSuccess(
              `/courses/${getCourseId()}/assessments/${response.data.id}`,
            );
        }, 200);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_ASSESSMENT_FAILURE });
        dispatch(setNotification(failureMessage));

        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
};

export const updateAssessment = (
  assessmentId: number,
  data,
  successMessage: string,
  failureMessage: string,
  setError,
  onSuccess: (url: string) => void,
): Operation => {
  const attributes = data;
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments
      .update(assessmentId, attributes)
      .then(() => {
        dispatch({ type: actionTypes.UPDATE_ASSESSMENT_SUCCESS });
        dispatch(setNotification(successMessage));

        setTimeout(
          () =>
            onSuccess(`/courses/${getCourseId()}/assessments/${assessmentId}`),
          500,
        );
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_ASSESSMENT_FAILURE });
        dispatch(setNotification(failureMessage));

        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
};

export const syncWithKoditsu = async (assessmentId: number): Promise<void> => {
  try {
    await CourseAPI.assessment.assessments.syncWithKoditsu(assessmentId);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const inviteToKoditsu = async (assessmentId: number): Promise<void> => {
  try {
    await CourseAPI.assessment.assessments.inviteToKoditsu(assessmentId);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const deleteAssessment = async (
  deleteUrl: string,
): Promise<AssessmentDeleteResult> => {
  try {
    const response = await CourseAPI.assessment.assessments.delete(deleteUrl);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const authenticateAssessment = async (
  assessmentId: number,
  data,
): Promise<unknown> => {
  const adaptedData = { assessment: { password: data.password } };

  try {
    const response = await CourseAPI.assessment.assessments.authenticate(
      assessmentId,
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const unblockAssessment = async (
  assessmentId: number,
  password: string,
): Promise<string> => {
  try {
    const response = await CourseAPI.assessment.assessments.unblockMonitor(
      assessmentId,
      password,
    );

    return response.data.redirectUrl;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const attemptAssessment = async (
  assessmentId: number,
): Promise<JustRedirect> => {
  try {
    const response =
      await CourseAPI.assessment.assessments.attempt(assessmentId);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.error);

    throw error;
  }
};
