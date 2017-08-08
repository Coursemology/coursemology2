// See https://www.npmjs.com/package/mirror-creator
// Allows us to set up constants in a slightly more concise syntax.
import mirrorCreator from 'mirror-creator';

const editorActionTypes = mirrorCreator([
  'TOGGLE_SUBMIT_AS_FILE',
  'CODE_BLOCK_UPDATE',
  'TEST_CASE_CREATE',
  'TEST_CASE_UPDATE',
  'TEST_CASE_DELETE',
  'NEW_PACKAGE_FILE_UPDATE',
  'NEW_PACKAGE_FILE_DELETE',
  'EXISTING_PACKAGE_FILE_DELETE',
]);

export default editorActionTypes;
