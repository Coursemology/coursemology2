import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';

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

export const reorderQuestions = async (assessmentId, questionIds) => {
  // TODO: Conform POST data to `QuestionOrderPostData` once written in TypeScript
  const response = await CourseAPI.assessment.assessments.reorderQuestions(
    assessmentId,
    { question_order: questionIds },
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
        // TODO: Remove redirection when assessment index is implemented using React.
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/assessments/${
              response.data.id
            }`;
          }
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
        // TODO: Remove redirection when assessment index is implemented using React.
        setTimeout(() => {
          window.location = `/courses/${getCourseId()}/assessments/${assessmentId}`;
        }, 500);
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
