import { editorActionTypes as actionTypes } from '../constants';

export function toggleSubmitAsFile(newValue) {
  return {
    type: actionTypes.TOGGLE_SUBMIT_AS_FILE,
    newValue,
  };
}

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

export function updateNewPackageFile(fileType, filename, index) {
  return {
    type: actionTypes.NEW_PACKAGE_FILE_UPDATE,
    fileType,
    index,
    filename,
  };
}

export function deleteNewPackageFile(fileType, index) {
  return {
    type: actionTypes.NEW_PACKAGE_FILE_DELETE,
    fileType,
    index,
  };
}

export function deleteExistingPackageFile(fileType, filename, toDelete) {
  return {
    type: actionTypes.EXISTING_PACKAGE_FILE_DELETE,
    fileType,
    filename,
    toDelete,
  };
}
