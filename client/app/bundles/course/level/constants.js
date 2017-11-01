import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'LOAD_LEVELS_REQUEST',
  'LOAD_LEVELS_SUCCESS',
  'LOAD_LEVELS_FAILURE',
]);

export default actionTypes;
