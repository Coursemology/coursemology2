import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'PROGRAMMING_QUESTION_UPDATE',
  'SKILLS_UPDATE',
  'EDITOR_MODE_UPDATE',
  'TEMPLATE_TAB_UPDATE',
  'SUBMIT_FORM_LOADING',
  'SUBMIT_FORM_SUCCESS',
  'SUBMIT_FORM_FAILURE',
  'SUBMIT_FORM_EVALUATING',
]);

export default actionTypes;
