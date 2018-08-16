import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator([
  'PROGRAMMING_QUESTION',
]);

export const programmingLanguages = {
  JAVASCRIPT: 1,
  PYTHON_2_7: 2,
  PYTHON_3_4: 3,
  PYTHON_3_5: 4,
  PYTHON_3_6: 5,
  C_CPP: 6,
  JAVA: 7,
};

export const aceEditorModes = {
  C_CPP: 'c_cpp',
  JAVA: 'java',
  PYTHON: 'python',
};
