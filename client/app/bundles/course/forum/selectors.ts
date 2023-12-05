/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { EntityId } from '@reduxjs/toolkit';
import { AppState } from 'store';
import { ForumTopicEntity } from 'types/course/forums';

import {
  forumAdapter,
  forumTopicAdapter,
  forumTopicPostAdapter,
} from './store';

const forumSelectors = forumAdapter.getSelectors<AppState>(
  (state) => state.forums.forums,
);

const forumTopicSelectors = forumTopicAdapter.getSelectors<AppState>(
  (state) => state.forums.topics,
);

const forumTopicPostSelectors = forumTopicPostAdapter.getSelectors<AppState>(
  (state) => state.forums.posts,
);

function getLocalState(state: AppState) {
  return state.forums;
}

export function getAllForums(state: AppState) {
  return forumSelectors.selectAll(state);
}

export function getForum(state: AppState, id?: EntityId) {
  if (!id) return undefined;
  return forumSelectors.selectById(state, +id);
}

export function getForumPermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getForumMetadata(state: AppState) {
  return getLocalState(state).metadata;
}

export function getForumTopics(state: AppState, topicIds?: EntityId[] | null) {
  const ForumTopicEntities: ForumTopicEntity[] = [];
  if (!topicIds) return ForumTopicEntities;
  topicIds.forEach((topicId) => {
    const entity = forumTopicSelectors.selectById(state, +topicId);
    if (entity) {
      ForumTopicEntities.push(entity);
    }
  });
  return ForumTopicEntities;
}

export function getForumTopic(state: AppState, id?: EntityId) {
  if (!id) return undefined;
  return forumTopicSelectors.selectById(state, +id);
}

export function getForumTopicPost(state: AppState, id?: EntityId) {
  if (!id) return undefined;
  return forumTopicPostSelectors.selectById(state, +id);
}
