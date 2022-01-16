import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator(['GROUP_CATEGORY']);

const actionTypes = mirrorCreator([
  // For showing a group category
  'FETCH_GROUPS_REQUEST',
  'FETCH_GROUPS_SUCCESS',
  'FETCH_GROUPS_FAILURE',

  // For creating a new group category
  'CATEGORY_FORM_SHOW',
  'CATEGORY_FORM_CANCEL',
  'CATEGORY_FORM_CONFIRM_CANCEL',
  'CATEGORY_FORM_CONFIRM_DISCARD',
  'CREATE_CATEGORY_REQUEST',
  'CREATE_CATEGORY_SUCCESS',
  'CREATE_CATEGORY_FAILURE',
]);

export default actionTypes;

// TODO: i18n magic strings
export const errorMessages = {
  fetchFailure: 'Failed to fetch group data! Please reload and try again.',
};
