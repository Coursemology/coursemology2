import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'MARK_AS_READ_REQUEST',
  'MARK_AS_READ_SUCCESS',
  'MARK_AS_READ_FAILURE',
]);

export default actionTypes;
