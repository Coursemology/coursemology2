import actionTypes from '../constants/onlineEditorConstants';

export function updatePythonCodeBlock(field, newValue) {
  return {
    type: actionTypes.PYTHON_CODE_BLOCK_UPDATE,
    field: field,
    newValue: newValue
  };
}

export function createPythonTestCase(testType) {
  return {
    type: actionTypes.PYTHON_TEST_CASE_CREATE,
    testType: testType
  };
}

export function updatePythonTestCase(testType, index, field, newValue) {
  return {
    type: actionTypes.PYTHON_TEST_CASE_UPDATE,
    testType: testType,
    index: index,
    field: field,
    newValue: newValue
  };
}

export function deletePythonTestCase(testType, index) {
  return {
    type: actionTypes.PYTHON_TEST_CASE_DELETE,
    testType: testType,
    index: index
  };
}
