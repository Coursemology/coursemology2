/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from 'axios';
import { Operation } from 'store';
import {
  AssessmentDeleteResult,
  AssessmentsListData,
  AssessmentUnlockRequirements,
  FetchAssessmentData,
  QuestionOrderPostData,
} from 'types/course/assessment/assessments';
import { MonitoringRequestData } from 'types/course/assessment/monitoring';
import { McqMrqListData } from 'types/course/assessment/question/multiple-responses';
import { QuestionDuplicationResult } from 'types/course/assessment/questions';
import { AssessmentMarksPerQuestionStats } from 'types/course/statistics/assessmentStatistics';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';
import { setNotification } from 'lib/actions';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';

import {
  processAncestor,
  processAssessment,
  processCourseUser,
  processSubmission,
} from './utils/statisticsUtils';
import actionTypes from './constants';

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
  assessmentId: string | null,
): Promise<any> => {
  const response =
    await CourseAPI.assessment.assessments.fetchEditData(assessmentId);

  return response.data;
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

export const reorderQuestions = async (
  assessmentId: number,
  questionIds: number[],
): Promise<QuestionOrderPostData> => {
  const response = await CourseAPI.assessment.assessments.reorderQuestions(
    assessmentId,
    questionIds,
  );
  return response.data;
};

export const duplicateQuestion = async (
  duplicationUrl: string,
): Promise<QuestionDuplicationResult> => {
  try {
    const response =
      await CourseAPI.assessment.assessments.duplicateQuestion(duplicationUrl);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const deleteQuestion = async (questionUrl: string): Promise<void> => {
  try {
    await CourseAPI.assessment.assessments.deleteQuestion(questionUrl);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const convertMcqMrq = async (
  convertUrl: string,
): Promise<McqMrqListData> => {
  try {
    const response =
      await CourseAPI.assessment.assessments.convertMcqMrq(convertUrl);
    return response.data;
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

export function fetchStatistics(
  assessmentId: number,
  failureMessage: string,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_STATISTICS_REQUEST });
    return CourseAPI.statistics.assessment
      .fetchStatistics(assessmentId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_STATISTICS_SUCCESS,
          assessment: processAssessment(response.data.assessment),
          submissions: response.data.submissions.map(processSubmission),
          allStudents: response.data.allStudents.map(processCourseUser),
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_STATISTICS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };
}

export function fetchAncestors(
  assessmentId: number,
  failureMessage: string,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_ANCESTORS_REQUEST });
    return CourseAPI.statistics.assessment
      .fetchAncestors(assessmentId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_ANCESTORS_SUCCESS,
          ancestors: response.data.assessments.map(processAncestor),
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_ANCESTORS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };
}

export function fetchAncestorStatistics(
  ancestorId: number,
  failureMessage: string,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_ANCESTOR_STATISTICS_REQUEST });
    return CourseAPI.statistics.assessment
      .fetchStatistics(ancestorId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_ANCESTOR_STATISTICS_SUCCESS,
          assessment: processAssessment(response.data.assessment),
          submissions: response.data.submissions.map(processSubmission),
          allStudents: response.data.allStudents.map(processCourseUser),
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_ANCESTOR_STATISTICS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };
}

export const fetchStudentMarkPerQuestion = async (
  assessmentId: string | number,
): Promise<AssessmentMarksPerQuestionStats> => {
  const response =
    await CourseAPI.statistics.assessment.fetchMarksPerQuestionStats(
      assessmentId,
    );
  return response.data;
};

export const fetchMonitoringData = async (): Promise<MonitoringRequestData> => {
  const response = await CourseAPI.assessment.assessments.fetchMonitoringData();
  return response.data;
};
