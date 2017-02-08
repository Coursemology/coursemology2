import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator([
  'ASSESSMENT',
]);

const actionTypes = mirrorCreator([
  'ASSESSMENT_FORM_SHOW',
  'CREATE_ASSESSMENT_REQUEST',
  'CREATE_ASSESSMENT_SUCCESS',
  'CREATE_ASSESSMENT_FAILURE',
]);

export default actionTypes;
