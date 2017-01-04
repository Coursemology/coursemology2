import actionTypes from '../constants/onlineEditorConstants';

export function updatePythonCodeBlock(field, newValue) {
  return {
    type: actionTypes.PYTHON_CODE_BLOCK_UPDATE,
    field,
    newValue,
  };
}

export function createPythonTestCase(testType) {
  return {
    type: actionTypes.PYTHON_TEST_CASE_CREATE,
    testType,
  };
}

export function updatePythonTestCase(testType, index, field, newValue) {
  return {
    type: actionTypes.PYTHON_TEST_CASE_UPDATE,
    testType,
    index,
    field,
    newValue,
  };
}

export function deletePythonTestCase(testType, index) {
  return {
    type: actionTypes.PYTHON_TEST_CASE_DELETE,
    testType,
    index,
  };
}
