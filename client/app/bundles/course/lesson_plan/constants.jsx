import mirrorCreator from 'mirror-creator';

export const constants = mirrorCreator([
  'PRIOR_ITEMS_MILESTONE',
]);

const actionTypes = mirrorCreator([
  'TOGGLE_LESSON_PLAN_ITEM_TYPE_VISIBILITY',
  'SET_SURVEY_NOTIFICATION',
  'RESET_SURVEY_NOTIFICATION',
  'ITEM_UPDATE_REQUEST',
  'ITEM_UPDATE_SUCCESS',
  'ITEM_UPDATE_FAILURE',
  'MILESTONE_UPDATE_REQUEST',
  'MILESTONE_UPDATE_SUCCESS',
  'MILESTONE_UPDATE_FAILURE',
]);

export default actionTypes;
