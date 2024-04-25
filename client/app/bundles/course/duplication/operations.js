import CourseAPI from 'api/course';
import actionTypes from 'course/duplication/constants';
import pollJob from 'lib/helpers/jobHelpers';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { loadingToast } from 'lib/hooks/toast';

import { actions } from './store';
import { getItemsPayload } from './utils';

const DUPLICATE_JOB_POLL_INTERVAL_MS = 2000;

export function fetchObjectsList() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_OBJECTS_LIST_REQUEST });
    return CourseAPI.duplication
      .fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_OBJECTS_LIST_SUCCESS,
          duplicationData: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_OBJECTS_LIST_FAILURE });
      });
  };
}

export function duplicateItems(
  destinationCourseId,
  selectedItems,
  successMessage,
  pendingMessage,
  failureMessage,
) {
  const payload = {
    object_duplication: {
      destination_course_id: destinationCourseId,
      items: getItemsPayload(selectedItems),
    },
  };

  return (dispatch, getState) => {
    const sourceCourseId = getState().duplication.sourceCourse.id;

    const toast = loadingToast(pendingMessage);

    const handleSuccess = (successData) => {
      toast.success(successMessage);
      window.location.href = successData.redirectUrl;
      dispatch({ type: actionTypes.DUPLICATE_ITEMS_SUCCESS });
    };

    const handleFailure = () => {
      dispatch({ type: actionTypes.DUPLICATE_ITEMS_FAILURE });
      dispatch(actions.hideDuplicateItemsConfirmation());
      toast.error(failureMessage);
    };

    dispatch({ type: actionTypes.DUPLICATE_ITEMS_REQUEST });
    return CourseAPI.duplication
      .duplicateItems(sourceCourseId, payload)
      .then((response) => response.data)
      .then((data) => {
        pollJob(
          data.jobUrl,
          handleSuccess,
          handleFailure,
          DUPLICATE_JOB_POLL_INTERVAL_MS,
        );
      })
      .catch(handleFailure);
  };
}

export function duplicateCourse(
  fields,
  destinationHost,
  successMessage,
  pendingMessage,
  failureMessage,
  setError,
) {
  const payload = { duplication: fields };

  return (dispatch, getState) => {
    const sourceCourseId = getState().duplication.sourceCourse.id;

    const toast = loadingToast(pendingMessage);

    const handleJobSuccess = (successData) => {
      toast.success(successMessage);
      const destinationUrl = `${window.location.protocol}//${
        destinationHost ?? window.location.host
      }${successData.redirectUrl}`;

      window.location = destinationUrl;
      dispatch({ type: actionTypes.DUPLICATE_COURSE_SUCCESS });
    };

    const handleFailure = (error) => {
      dispatch({ type: actionTypes.DUPLICATE_COURSE_FAILURE });
      if (error?.response?.data?.errors) {
        setReactHookFormError(setError, error.response.data.errors);
      }
      toast.error(failureMessage);
    };

    dispatch({ type: actionTypes.DUPLICATE_COURSE_REQUEST });
    return CourseAPI.duplication
      .duplicateCourse(sourceCourseId, payload)
      .then((response) => response.data)
      .then((data) => {
        pollJob(
          data.jobUrl,
          handleJobSuccess,
          handleFailure,
          DUPLICATE_JOB_POLL_INTERVAL_MS,
        );
      })
      .catch(handleFailure);
  };
}
