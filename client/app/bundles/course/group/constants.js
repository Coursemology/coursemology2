import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator(['GROUP_CATEGORY']);

export const dialogTypes = mirrorCreator([
  'CREATE_CATEGORY',
  'UPDATE_CATEGORY',
]);

const actionTypes = mirrorCreator([
  // For notification
  'SET_NOTIFICATION',

  // For showing a group category
  'FETCH_GROUPS_REQUEST',
  'FETCH_GROUPS_SUCCESS',
  'FETCH_GROUPS_FAILURE',

  // For dialog management
  'DIALOG_CANCEL',
  'DIALOG_CONFIRM_CANCEL',
  'DIALOG_CONFIRM_DISCARD',

  // For creating a new group category or updating an existing category
  'CREATE_CATEGORY_FORM_SHOW',
  'CREATE_CATEGORY_REQUEST',
  'CREATE_CATEGORY_SUCCESS',
  'CREATE_CATEGORY_FAILURE',

  'UPDATE_CATEGORY_FORM_SHOW',
  'UPDATE_CATEGORY_REQUEST',
  'UPDATE_CATEGORY_SUCCESS',
  'UPDATE_CATEGORY_FAILURE',
]);

export default actionTypes;
