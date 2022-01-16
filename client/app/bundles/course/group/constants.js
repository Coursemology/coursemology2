import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator(['GROUP_CATEGORY']);

const actionTypes = mirrorCreator([
  // For notification
  'SET_NOTIFICATION',

  // For showing a group category
  'FETCH_GROUPS_REQUEST',
  'FETCH_GROUPS_SUCCESS',
  'FETCH_GROUPS_FAILURE',

  // For creating a new group category or updating an existing category
  'CATEGORY_FORM_SHOW',
  'CATEGORY_FORM_CANCEL',
  'CATEGORY_FORM_CONFIRM_CANCEL',
  'CATEGORY_FORM_CONFIRM_DISCARD',
  'CREATE_CATEGORY_REQUEST',
  'CREATE_CATEGORY_SUCCESS',
  'CREATE_CATEGORY_FAILURE',
  'UPDATE_CATEGORY_REQUEST',
  'UPDATE_CATEGORY_SUCCESS',
  'UPDATE_CATEGORY_FAILURE',
]);

export default actionTypes;
