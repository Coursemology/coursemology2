import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'FETCH_GROUPS_REQUEST',
  'FETCH_GROUPS_SUCCESS',
  'FETCH_GROUPS_FAILURE',
]);

export default actionTypes;

// TODO: i18n magic strings
export const errorMessages = {
  fetchFailure: 'Failed to fetch group data! Please reload and try again.',
};
