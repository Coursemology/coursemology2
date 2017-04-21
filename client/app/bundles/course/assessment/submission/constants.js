import mirrorCreator from 'mirror-creator';

export const DATA_STATES = {
  Error: 'error',
  Unfetched: 'unfetched',
  Fetching: 'fetching',
  Received: 'received',
};

export const questionTypes = mirrorCreator([
  'MultipleChoice',
  'MultipleResponse',
  'Programming',
  'TextResponse',
  'FileUpload',
  'Programming',
]);

export const TestCaseTypes = {
  Public: 'public_test',
  Private: 'private_test',
  Evaluation: 'evaluation_test',
};

const actionTypes = mirrorCreator([
  'FETCH_SUBMISSION_REQUEST',
  'FETCH_SUBMISSION_SUCCESS',
  'FETCH_SUBMISSION_FAILURE',
  'UPDATE_SUBMISSION_REQUEST',
  'UPDATE_SUBMISSION_SUCCESS',
  'UPDATE_SUBMISSION_FAILURE',
]);

export default actionTypes;
