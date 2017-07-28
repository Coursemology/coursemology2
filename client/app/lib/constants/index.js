import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'SET_NOTIFICATION',
  'SHOW_DELETE_CONFIRMATION',
  'RESET_DELETE_CONFIRMATION',
]);

export default actionTypes;
