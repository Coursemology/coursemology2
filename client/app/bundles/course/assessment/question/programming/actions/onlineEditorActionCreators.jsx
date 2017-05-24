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

export function updatePythonNewDataFile(filename, index) {
  return {
    type: actionTypes.PYTHON_NEW_DATA_FILE_UPDATE,
    index,
    filename,
  };
}

export function deletePythonNewDataFile(index) {
  return {
    type: actionTypes.PYTHON_NEW_DATA_FILE_DELETE,
    index,
  };
}

export function deletePythonExistingDataFile(filename, toDelete) {
  return {
    type: actionTypes.PYTHON_EXISTING_DATA_FILE_DELETE,
    filename,
    toDelete,
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

export function updateCppNewDataFile(filename, index) {
  return {
    type: actionTypes.CPP_NEW_DATA_FILE_UPDATE,
    index,
    filename,
  };
}

export function deleteCppNewDataFile(index) {
  return {
    type: actionTypes.CPP_NEW_DATA_FILE_DELETE,
    index,
  };
}

export function deleteCppExistingDataFile(filename, toDelete) {
  return {
    type: actionTypes.CPP_EXISTING_DATA_FILE_DELETE,
    filename,
    toDelete,
  };
}
