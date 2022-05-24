import CourseAPI from 'api/course';
import { setReactHookFormError } from 'lib/helpers/actions-helper';
import pollJob from 'lib/helpers/job-helpers';
import actionTypes from 'course/duplication/constants';
import { setNotification } from 'lib/actions';

const DUPLICATE_JOB_POLL_INTERVAL = 2000;

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

export function changeSourceCourse(courseId) {
  return (dispatch, getState) => {
    const currentSourceCourseId = getState().duplication.sourceCourse.id;
    if (courseId === currentSourceCourseId) {
      return null;
    }

    dispatch({ type: actionTypes.CHANGE_SOURCE_COURSE_REQUEST });
    return CourseAPI.duplication
      .data(courseId)
      .then((response) => {
        dispatch({
          type: actionTypes.CHANGE_SOURCE_COURSE_SUCCESS,
          courseData: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.CHANGE_SOURCE_COURSE_FAILURE });
      });
  };
}

export function setItemSelectedBoolean(itemType, id, value) {
  return {
    type: actionTypes.SET_ITEM_SELECTED_BOOLEAN,
    itemType,
    id,
    value,
  };
}

export function showDuplicateItemsConfirmation() {
  return { type: actionTypes.SHOW_DUPLICATE_ITEMS_CONFIRMATION };
}

export function hideDuplicateItemsConfirmation() {
  return { type: actionTypes.HIDE_DUPLICATE_ITEMS_CONFIRMATION };
}

export function setDestinationCourseId(destinationCourseId) {
  return { type: actionTypes.SET_DESTINATION_COURSE_ID, destinationCourseId };
}

export function setDuplicationMode(duplicationMode) {
  return { type: actionTypes.SET_DUPLICATION_MODE, duplicationMode };
}

export function setItemSelectorPanel(panel) {
  return { type: actionTypes.SET_ITEM_SELECTOR_PANEL, panel };
}

/**
 * Prepares the payload containing ids and types of items selected for duplication.
 *
 * @param {object} selectedItemsHash Maps types to hashes that indicate which items have been selected, e.g.
 *    { TAB: { 3: true, 4: false }, SURVEY: { 9: true }, CATEGORY: { 10: false } }
 * @return {object} Maps types to arrays with ids of items that have been selected, e.g.
 *    { TAB: [3], SURVEY: [9] }
 */
function itemsPayload(selectedItemsHash) {
  return Object.keys(selectedItemsHash).reduce((hash, key) => {
    const idsHash = selectedItemsHash[key];
    const idsArray = Object.keys(idsHash).reduce((selectedIds, id) => {
      if (idsHash[id]) {
        selectedIds.push(id);
      }
      return selectedIds;
    }, []);
    if (idsArray.length > 0) {
      // eslint-disable-next-line no-param-reassign
      hash[key] = idsArray;
    }
    return hash;
  }, {});
}

export function duplicateItems(
  destinationCourseId,
  selectedItems,
  failureMessage,
) {
  const payload = {
    object_duplication: {
      destination_course_id: destinationCourseId,
      items: itemsPayload(selectedItems),
    },
  };

  return (dispatch, getState) => {
    const sourceCourseId = getState().duplication.sourceCourse.id;

    dispatch({ type: actionTypes.DUPLICATE_ITEMS_REQUEST });
    return CourseAPI.duplication
      .duplicateItems(sourceCourseId, payload)
      .then((response) => {
        dispatch({ type: actionTypes.DUPLICATE_ITEMS_SUCCESS });
        window.location = response.data.redirect_url;
      })
      .catch(() => {
        dispatch({ type: actionTypes.DUPLICATE_ITEMS_FAILURE });
        dispatch(hideDuplicateItemsConfirmation());
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function duplicateCourse(
  fields,
  successMessage,
  pendingMessage,
  failureMessage,
  setError,
) {
  const payload = { duplication: fields };

  return (dispatch, getState) => {
    const sourceCourseId = getState().duplication.sourceCourse.id;

    const handleSuccess = (successData) => {
      dispatch(setNotification(successMessage));
      window.location.href = successData.redirect_url;
      dispatch({ type: actionTypes.DUPLICATE_COURSE_SUCCESS });
    };

    const handleFailure = (error) => {
      dispatch({ type: actionTypes.DUPLICATE_COURSE_FAILURE });
      if (error.response && error.response.data) {
        setReactHookFormError(setError, error.response.data.errors);
      }
      dispatch(setNotification(failureMessage));
    };

    dispatch({ type: actionTypes.DUPLICATE_COURSE_REQUEST });
    return CourseAPI.duplication
      .duplicateCourse(sourceCourseId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch(setNotification(pendingMessage));
        pollJob(
          data.redirect_url,
          DUPLICATE_JOB_POLL_INTERVAL,
          handleSuccess,
          handleFailure,
        );
      })
      .catch(handleFailure);
  };
}
