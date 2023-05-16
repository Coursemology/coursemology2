/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectEntities, selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.comments;
}

export function getPermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getSettings(state: AppState) {
  return getLocalState(state).settings;
}

export function getTabInfo(state: AppState) {
  return getLocalState(state).tabs;
}

export function getTopicCount(state: AppState) {
  return getLocalState(state).topicCount;
}

export function getAllCommentTopicEntities(state: AppState) {
  return selectEntities(
    getLocalState(state).topicList,
    getLocalState(state).topicList.ids,
  );
}

export function getAllCommentPostMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).postList,
    getLocalState(state).postList.ids,
  );
}

export function getTabValue(state: AppState) {
  return getLocalState(state).pageState.tabValue;
}
