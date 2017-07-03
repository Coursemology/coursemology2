import actionTypes from '../constants/onlineEditorConstants';

export function updateCodeBlock(field, newValue) {
  return {
    type: actionTypes.CODE_BLOCK_UPDATE,
    field,
    newValue,
  };
}

export function createTestCase(testType) {
  return {
    type: actionTypes.TEST_CASE_CREATE,
    testType,
  };
}

export function updateTestCase(testType, index, field, newValue) {
  return {
    type: actionTypes.TEST_CASE_UPDATE,
    testType,
    index,
    field,
    newValue,
  };
}

export function deleteTestCase(testType, index) {
  return {
    type: actionTypes.TEST_CASE_DELETE,
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
