import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';

import {
  processAncestor,
  processAssessment,
  processCourseUser,
  processSubmission,
} from './utils/statisticsUtils';
import actionTypes from './constants';

export const fetchAssessments = async (categoryId, tabId) => {
  const response = await CourseAPI.assessment.assessments.index(
    categoryId,
    tabId,
  );

  return response.data;
};

export const fetchAssessment = async (id) => {
  const response = await CourseAPI.assessment.assessments.fetch(id);
  return response.data;
};

export const fetchAssessmentUnlockRequirements = async (id) => {
  const response =
    await CourseAPI.assessment.assessments.fetchUnlockRequirements(id);
  return response.data;
};

export const fetchAssessmentEditData = async (assessmentId) => {
  const response = await CourseAPI.assessment.assessments.fetchEditData(
    assessmentId,
  );

  return response.data;
};

export const deleteAssessment = async (deleteUrl) => {
  try {
    const response = await CourseAPI.assessment.assessments.delete(deleteUrl);
    // TODO: Conform response data to `AssessmentDeleteResult` once written in TypeScript
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const authenticateAssessment = async (assessmentId, data) => {
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

export const attemptAssessment = async (assessmentId) => {
  try {
    const response = await CourseAPI.assessment.assessments.attempt(
      assessmentId,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.error);

    throw error;
  }
};

export const reorderQuestions = async (assessmentId, questionIds) => {
  // TODO: Conform POST data to `QuestionOrderPostData` once written in TypeScript
  const response = await CourseAPI.assessment.assessments.reorderQuestions(
    assessmentId,
    questionIds,
  );
  return response.data;
};

export const duplicateQuestion = async (duplicationUrl) => {
  try {
    const response = await CourseAPI.assessment.assessments.duplicateQuestion(
      duplicationUrl,
    );
    // TODO: Conform response data to `QuestionDuplicationResult` once written in TypeScript
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const deleteQuestion = async (questionUrl) => {
  try {
    await CourseAPI.assessment.assessments.deleteQuestion(questionUrl);
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const convertMcqMrq = async (convertUrl) => {
  try {
    const response = await CourseAPI.assessment.assessments.convertMcqMrq(
      convertUrl,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const createAssessment = (
  categoryId,
  tabId,
  data,
  successMessage,
  failureMessage,
  setError,
  onSuccess,
) => {
  const attributes = { ...data, category: categoryId, tab: tabId };
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments
      .create(attributes)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_ASSESSMENT_SUCCESS,
          message: successMessage,
        });
        setTimeout(() => {
          if (response.data && response.data.id)
            onSuccess(
              `/courses/${getCourseId()}/assessments/${response.data.id}`,
            );
        }, 200);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CREATE_ASSESSMENT_FAILURE,
          message: failureMessage,
        });

        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
};

export const updateAssessment = (
  assessmentId,
  data,
  successMessage,
  failureMessage,
  setError,
  onSuccess,
) => {
  const attributes = data;
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments
      .update(assessmentId, attributes)
      .then(() => {
        dispatch({
          type: actionTypes.UPDATE_ASSESSMENT_SUCCESS,
          message: successMessage,
        });
        setTimeout(
          () =>
            onSuccess(`/courses/${getCourseId()}/assessments/${assessmentId}`),
          500,
        );
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPDATE_ASSESSMENT_FAILURE,
          message: failureMessage,
        });

        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
};

export function fetchStatistics(assessmentId, failureMessage) {
  return (dispatch) => {
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
        dispatch({
          type: actionTypes.FETCH_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export function fetchAncestors(assessmentId, failureMessage) {
  return (dispatch) => {
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
        dispatch({
          type: actionTypes.FETCH_ANCESTORS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export function fetchAncestorStatistics(ancestorId, failureMessage) {
  return (dispatch) => {
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
        dispatch({
          type: actionTypes.FETCH_ANCESTOR_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export const fetchMonitoringData = async () => {
  const response = await CourseAPI.assessment.assessments.fetchMonitoringData();
  return response.data;
};
