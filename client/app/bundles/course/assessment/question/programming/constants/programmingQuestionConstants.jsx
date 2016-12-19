import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'PROGRAMMING_QUESTION_UPDATE',
  'SKILLS_UPDATE',
  'EDITOR_MODE_UPDATE',
  'TEMPLATE_TAB_UPDATE'
]);

export default actionTypes;
