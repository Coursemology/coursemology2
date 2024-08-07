import mirrorCreator from 'mirror-creator';

export const duplicationModes = mirrorCreator(['OBJECT', 'COURSE']);

// These are mirrored in app/helpers/course/object_duplications_helper.rb
export const duplicableItemTypes = mirrorCreator([
  'ASSESSMENT',
  'TAB',
  'CATEGORY',
  'SURVEY',
  'ACHIEVEMENT',
  'FOLDER',
  'MATERIAL',
  'VIDEO',
  'VIDEO_TAB',
]);

// These are mirrored in app/helpers/course/object_duplications_helper.rb
export const itemSelectorPanels = mirrorCreator([
  'ASSESSMENTS',
  'SURVEYS',
  'ACHIEVEMENTS',
  'MATERIALS',
  'VIDEOS',
]);

export const formNames = mirrorCreator(['NEW_COURSE']);

export const indentClassName = {
  0: 'ml-0',
  1: 'ml-8',
  2: 'ml-16',
};

const actionTypes = mirrorCreator([
  'LOAD_OBJECTS_LIST_REQUEST',
  'LOAD_OBJECTS_LIST_SUCCESS',
  'LOAD_OBJECTS_LIST_FAILURE',
  'DUPLICATE_ITEMS_REQUEST',
  'DUPLICATE_ITEMS_SUCCESS',
  'DUPLICATE_ITEMS_FAILURE',
  'DUPLICATE_COURSE_REQUEST',
  'DUPLICATE_COURSE_SUCCESS',
  'DUPLICATE_COURSE_FAILURE',
  'SHOW_DUPLICATE_ITEMS_CONFIRMATION',
  'HIDE_DUPLICATE_ITEMS_CONFIRMATION',
  'SET_ITEM_SELECTED_BOOLEAN',
  'SET_DESTINATION_COURSE_ID',
  'SET_DUPLICATION_MODE',
  'SET_ITEM_SELECTOR_PANEL',
]);

export default actionTypes;
