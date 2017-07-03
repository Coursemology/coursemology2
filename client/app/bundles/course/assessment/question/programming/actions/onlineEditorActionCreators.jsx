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

export function updateCppCodeBlock(field, newValue) {
  return {
    type: actionTypes.CPP_CODE_BLOCK_UPDATE,
    field,
    newValue,
  };
}

export function createCppTestCase(testType) {
  return {
    type: actionTypes.CPP_TEST_CASE_CREATE,
    testType,
  };
}

export function updateCppTestCase(testType, index, field, newValue) {
  return {
    type: actionTypes.CPP_TEST_CASE_UPDATE,
    testType,
    index,
    field,
    newValue,
  };
}

export function deleteCppTestCase(testType, index) {
  return {
    type: actionTypes.CPP_TEST_CASE_DELETE,
    testType,
    index,
  };
}

export function updateNewDataFile(filename, index) {
  return {
    type: actionTypes.NEW_DATA_FILE_UPDATE,
    index,
    filename,
  };
}

export function deleteNewDataFile(index) {
  return {
    type: actionTypes.NEW_DATA_FILE_DELETE,
    index,
  };
}

export function deleteExistingDataFile(filename, toDelete) {
  return {
    type: actionTypes.EXISTING_DATA_FILE_DELETE,
    filename,
    toDelete,
  };
}
