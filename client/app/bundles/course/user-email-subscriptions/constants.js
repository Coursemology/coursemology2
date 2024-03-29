import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'LOAD_USER_EMAIL_SUBSCRIPTION_REQUEST',
  'LOAD_USER_EMAIL_SUBSCRIPTION_SUCCESS',
  'LOAD_USER_EMAIL_SUBSCRIPTION_FAILURE',
  'USER_EMAIL_SUBSCRIPTION_UPDATE_REQUEST',
  'USER_EMAIL_SUBSCRIPTION_UPDATE_SUCCESS',
  'USER_EMAIL_SUBSCRIPTION_UPDATE_FAILURE',
]);

export default actionTypes;
