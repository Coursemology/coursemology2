import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'NOTIFICATION_SETTING_UPDATE_REQUEST',
  'NOTIFICATION_SETTING_UPDATE_SUCCESS',
  'NOTIFICATION_SETTING_UPDATE_FAILURE',
]);

export default actionTypes;
