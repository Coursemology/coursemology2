import CourseAPI from 'api/course';
import actionTypes from 'course/duplication/constants';
import { setNotification } from 'lib/actions';

export function fetchObjectsList() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_OBJECTS_LIST_REQUEST });
    return CourseAPI.duplication.fetch()
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

export function setTargetCourseId(targetCourseId) {
  return { type: actionTypes.SET_TARGET_COURSE_ID, targetCourseId };
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
      if (idsHash[id]) { selectedIds.push(id); }
      return selectedIds;
    }, []);
    if (idsArray.length > 0) { hash[key] = idsArray; } // eslint-disable-line no-param-reassign
    return hash;
  }, {});
}

export function duplicateItems(targetCourseId, selectedItems, failureMessage) {
  const payload = {
    object_duplication: {
      target_course_id: targetCourseId,
      items: itemsPayload(selectedItems),
    },
  };

  return (dispatch) => {
    dispatch({ type: actionTypes.DUPLICATE_ITEMS_REQUEST });
    return CourseAPI.duplication.duplicateItems(payload)
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

export function duplicateCourse(fields, failureMessage) {
  const payload = { duplication: fields };

  return (dispatch) => {
    dispatch({ type: actionTypes.DUPLICATE_COURSE_REQUEST });
    return CourseAPI.duplication.duplicateCourse(payload)
      .then((response) => {
        window.location = response.data.redirect_url;
        dispatch({ type: actionTypes.DUPLICATE_COURSE_SUCCESS });
      })
      .catch(() => {
        dispatch({ type: actionTypes.DUPLICATE_COURSE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
