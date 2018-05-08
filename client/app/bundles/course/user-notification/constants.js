import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'FETCH_NOTIFICATION_REQUEST',
  'FETCH_NOTIFICATION_SUCCESS',
  'FETCH_NOTIFICATION_FAILURE',
  'MARK_AS_READ_REQUEST',
  'MARK_AS_READ_SUCCESS',
  'MARK_AS_READ_FAILURE',
]);

export default actionTypes;
