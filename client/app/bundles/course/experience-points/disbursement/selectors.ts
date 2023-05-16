/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.disbursement;
}

export function getAllCourseGroupMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).courseGroups,
    getLocalState(state).courseGroups.ids,
  );
}

export function getAllFilteredUserMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).courseUsers,
    getLocalState(state).courseUsers.ids,
  );
}

export function getFilters(state: AppState) {
  return getLocalState(state).filters;
}

export function getAllForumDisbursementUserEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).forumUsers,
    getLocalState(state).forumUsers.ids,
  );
}

export function getAllForumPostEntitiesForUser(
  state: AppState,
  userId?: number,
) {
  if (userId) {
    return selectMiniEntities(
      getLocalState(state).forumPosts,
      getLocalState(state).forumPosts.ids,
    ).filter((post) => post.userId === userId);
  }
  return [];
}
