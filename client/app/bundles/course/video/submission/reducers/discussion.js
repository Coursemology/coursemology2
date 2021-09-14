import { Map as makeImmutableMap } from 'immutable';
import {
  discussionActionTypes,
  postRequestingStatuses,
} from 'lib/constants/videoConstants';
import { combineReducers } from 'redux';

export const initialState = {
  newTopicPost: {
    content: '',
    status: postRequestingStatuses.LOADED,
  },
  topics: makeImmutableMap(),
  posts: makeImmutableMap(),
  pendingReplyPosts: makeImmutableMap(),
  scrolling: {
    scrollTopicId: null,
    autoScroll: false,
  },
};

const postDefaults = {
  editedContent: null,
  status: postRequestingStatuses.LOADED,
  editMode: false,
};

const topicDefaults = {
  status: postRequestingStatuses.LOADED,
};

const replyDefaults = {
  editorVisible: true,
  content: '',
  status: postRequestingStatuses.LOADED,
};

/**
 * Organises the discussion entitles (posts and topics) into ImmutableJS map for efficient and explicit larger size
 * entity stores.
 *
 * This function also merges in the default state parameters for the entities.
 * @param discussion The discussion props parsed from JSON directly
 * @returns {*} A copy of the discussion props but with the topics and posts changed (other discussion module states
 * are not added in this function
 */
export function organiseDiscussionEntities(discussion) {
  // A new video likely has nothing at all
  if (discussion === undefined) {
    return {};
  }
  const immutableEntitiesStore = {
    topics: makeImmutableMap(discussion.topics).map((topic) => ({
      ...topicDefaults,
      ...topic,
    })),
    posts: makeImmutableMap(discussion.posts).map((post) => ({
      ...postDefaults,
      ...post,
    })),
  };

  return { ...discussion, ...immutableEntitiesStore };
}

function newTopicPost(state = initialState.newTopicPost, action) {
  switch (action.type) {
    case discussionActionTypes.UPDATE_NEW_POST:
      return { ...state, ...action.postProps };
    default:
      return state;
  }
}

function topics(state = initialState.topics, action) {
  switch (action.type) {
    case discussionActionTypes.ADD_TOPIC:
      return state.set(action.topicId, {
        ...topicDefaults,
        ...action.topicProps,
      });
    case discussionActionTypes.UPDATE_TOPIC:
      return state.set(action.topicId, {
        ...state.get(action.topicId),
        ...action.topicProps,
      });
    case discussionActionTypes.REMOVE_TOPIC:
      return state.delete(action.topicId);
    case discussionActionTypes.REFRESH_ALL:
      return makeImmutableMap(action.topics).map((topic) => ({
        ...topicDefaults,
        ...topic,
      }));
    default:
      return state;
  }
}

function posts(state = initialState.posts, action) {
  switch (action.type) {
    case discussionActionTypes.ADD_POST:
      return state.set(action.postId, { ...postDefaults, ...action.postProps });
    case discussionActionTypes.UPDATE_POST:
      return state.set(action.postId, {
        ...state.get(action.postId),
        ...action.postProps,
      });
    case discussionActionTypes.REMOVE_POST:
      return state.delete(action.postId);
    case discussionActionTypes.REFRESH_ALL:
      return makeImmutableMap(action.posts).map((post) => ({
        ...postDefaults,
        ...post,
      }));
    default:
      return state;
  }
}

function pendingReplyPosts(state = initialState.pendingReplyPosts, action) {
  switch (action.type) {
    case discussionActionTypes.ADD_REPLY:
      return state.set(action.topicId, { ...replyDefaults });
    case discussionActionTypes.UPDATE_REPLY:
      return state.set(action.topicId, {
        ...state.get(action.topicId),
        ...action.replyProps,
      });
    case discussionActionTypes.REMOVE_REPLY:
      return state.delete(action.topicId);
    default:
      return state;
  }
}

function scrolling(state = initialState.scrolling, action) {
  switch (action.type) {
    case discussionActionTypes.CHANGE_AUTO_SCROLL:
      // We reset topic scrolling on auto scroll toggle
      return { ...state, autoScroll: action.autoScroll, scrollTopicId: null };
    case discussionActionTypes.ADD_TOPIC:
      return { ...state, scrollTopicId: action.topicId };
    case discussionActionTypes.UNSET_SCROLL_TOPIC:
      return { ...state, scrollTopicId: null };
    default:
      return state;
  }
}

export default combineReducers({
  newTopicPost,
  topics,
  posts,
  pendingReplyPosts,
  scrolling,
});
