// See https://www.npmjs.com/package/mirror-creator
// Allows us to set up constants in a slightly more concise syntax.
import mirrorCreator from 'mirror-creator';

const editorActionTypes = mirrorCreator([
  'PYTHON_CODE_BLOCK_UPDATE',
  'PYTHON_TEST_CASE_CREATE',
  'PYTHON_TEST_CASE_UPDATE',
  'PYTHON_TEST_CASE_DELETE',
  'PYTHON_NEW_DATA_FILE_UPDATE',
  'PYTHON_NEW_DATA_FILE_DELETE',
  'PYTHON_EXISTING_DATA_FILE_DELETE',
]);

export default editorActionTypes;
