import actionTypes from '../constants/programmingQuestionConstants';

export function updateProgrammingQuestion(field, newValue) {
  return {
    type: actionTypes.PROGRAMMING_QUESTION_UPDATE,
    field: field,
    newValue: newValue
  };
}

export function updateSkills(skills) {
  return {
    type: actionTypes.SKILLS_UPDATE,
    skills: skills
  }
}

export function updateEditorMode(mode) {
  return {
    type: actionTypes.EDITOR_MODE_UPDATE,
    mode: mode
  }
}
