import mirrorCreator from 'mirror-creator';

export const duplicableItemTypes = mirrorCreator([
  'ASSESSMENT',
  'TAB',
  'CATEGORY',
  'SURVEY',
  'ACHIEVEMENT',
]);

const actionTypes = mirrorCreator([
  'LOAD_OBJECTS_LIST_REQUEST',
  'LOAD_OBJECTS_LIST_SUCCESS',
  'LOAD_OBJECTS_LIST_FAILURE',
  'DUPLICATE_ITEMS_REQUEST',
  'DUPLICATE_ITEMS_SUCCESS',
  'DUPLICATE_ITEMS_FAILURE',
  'SHOW_DUPLICATE_ITEMS_CONFIRMATION',
  'HIDE_DUPLICATE_ITEMS_CONFIRMATION',
  'SET_ITEM_SELECTED_BOOLEAN',
  'SET_TARGET_COURSE_ID',
]);

export default actionTypes;
