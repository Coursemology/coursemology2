import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator([
  'ASSESSMENT',
]);

const actionTypes = mirrorCreator([
  'ASSESSMENT_FORM_SHOW',
  'ASSESSMENT_FORM_CANCEL',
  'ASSESSMENT_FORM_CONFIRM_CANCEL',
  'ASSESSMENT_FORM_CONFIRM_DISCARD',
  'CREATE_ASSESSMENT_REQUEST',
  'CREATE_ASSESSMENT_SUCCESS',
  'CREATE_ASSESSMENT_FAILURE',
]);

export default actionTypes;
