import CourseAPI from 'api/course';
import { discussionActionTypes, postRequestingStatuses } from 'lib/constants/videoConstants';
import setNotification from './notification';

/**
 * Creates an action to update the new post being created with the main comment box.
 *
 * The new properties provided are meant to be merged in, and any omitted properties will not be affected.
 * @param postProps The new properties for the new post
 * @returns {{type: discussionActionTypes, postProps: Object}} The update action
 */
export function updateNewPost(postProps) {
  return {
    type: discussionActionTypes.UPDATE_NEW_POST,
    postProps,
  };
}

/**
 * Creates an action to add a new post.
 *
 * Note that this action does not update the children associations for the parent topic/post of this post. They have
 * to be changed via another action separately.
 *
 * Defaults in the reducer will be applied to the new post's properties if they are not specified.
 *
 * If a post with the id already exists, it will be totally replaced by this new post. Attributes will not be merged.
 * @param postId The id of the new post
 * @param postProps The state properties of the new post
 * @returns {{type: discussionActionTypes, postId: string, postProps: Object}} The add post action
 */
function addPost(postId, postProps) {
  return {
    type: discussionActionTypes.ADD_POST,
    postId,
    postProps,
  };
}

/**
 * Creates an action that will update the properties of an existing post.
 *
 * The new properties provided are meant to be merged in, and any omitted properties will not be affected.
 * @param postId The id of the post as a string
 * @param postProps The properties to update
 * @returns {{type: discussionActionTypes, postId: string, postProps: Object}} The update post action
 */
export function updatePost(postId, postProps) {
  return {
    type: discussionActionTypes.UPDATE_POST,
    postId,
    postProps,
  };
}

/**
 * Creates an action to remove a post from the state.
 *
 * This action will simply remove the post from the state dictionary. It will NOT update any associations. They have to
 * be updated via upsertTopic and updatePost.
 *
 * Also note that removing a post with children will produce orphans if no re-parenting operations are carried out.
 *
 * @param postId The id of the post to remove as a string
 * @returns {{type: discussionActionTypes, postId: string}} The remove post action
 */
function removePost(postId) {
  return {
    type: discussionActionTypes.REMOVE_POST,
    postId,
  };
}

/**
 * Creates an action to add a topic to the store.
 *
 * Defaults for a topic properties will be applied if they are not set.
 *
 * If a topic with the id already exists, it will be totally replaced by this new topic. Attributes will not be merged.
 *
 * This action will also set the topicId under for the scrolling state, signalling to the components that they
 * should scroll to the element for this new topic after it's rendered.
 * @param topicId The id of the new topic
 * @param topicProps The properties of the new topic
 * @returns {{type: discussionActionTypes, topicId: string, topicProps: Object}} The create topic action
 */
function addTopic(topicId, topicProps) {
  return {
    type: discussionActionTypes.ADD_TOPIC,
    topicId,
    topicProps,
  };
}

/**
 * Creates an action that will update the properties of an existing topic.
 *
 * The new properties provided are meant to be merged in, and any omitted properties will not be affected.
 * @param topicId The id of the post as a string
 * @param topicProps The properties to update
 * @returns {{type: discussionActionTypes, topicId: string, topicProps: Object}} The update topic action
 */
function updateTopic(topicId, topicProps) {
  return {
    type: discussionActionTypes.UPDATE_TOPIC,
    topicId,
    topicProps,
  };
}

/**
 * Creates an action to remove a topic.
 *
 * When a topic is removed, the posts that are nested under the topic will NOT be removed. Instead they will persist
 * in the state as orphaned entries.
 * @param topicId The id of the topic to remove
 * @returns {{type: discussionActionTypes, topicId: string}} The remove topic action
 */
function removeTopic(topicId) {
  return {
    type: discussionActionTypes.REMOVE_TOPIC,
    topicId,
  };
}

/**
 * Creates and action to add a reply to a topic.
 *
 * The reply will be created with default reply properties.
 * @param topicId The id of the topic the reply is for
 * @returns {{type: discussionActionTypes, topicId: string}} The add reply action
 */
export function addReply(topicId) {
  return {
    type: discussionActionTypes.ADD_REPLY,
    topicId,
  };
}

/**
 * Creates and action to update a reply.
 *
 * The properties provided will be merged into the original reply state. Properties that are not specified will not
 * be touched.
 * @param topicId The id of the topic the reply is for
 * @param replyProps The properties of the reply
 * @returns {{type: discussionActionTypes, topicId: string, replyProps: Object}} The update reply action
 */
export function updateReply(topicId, replyProps) {
  return {
    type: discussionActionTypes.UPDATE_REPLY,
    topicId,
    replyProps,
  };
}

/**
 * Creates an action to remove a reply.
 * @param topicId The topic id the reply is for, used as a key
 * @returns {{type: discussionActionTypes, topicId: string}} The remove reply action
 */
function removeReply(topicId) {
  return {
    type: discussionActionTypes.REMOVE_REPLY,
    topicId,
  };
}

/**
 * Creates an action to change the auto scrolling state for the comments.
 *
 * If enabled, the comments in the comments box should be displayed only as the video plays and surpasses the timestamp.
 * @param autoScroll The new autoscroll state
 * @returns {{type: discussionActionTypes, autoScroll: bool}}
 */
export function changeAutoScroll(autoScroll) {
  return {
    type: discussionActionTypes.CHANGE_AUTO_SCROLL,
    autoScroll,
  };
}

/**
 * Creates an action to unset the topic id in the scrolling state.
 *
 * Doing so will signal to the components that they should no longer snap to the topic's element on update.
 * @return {{type: discussionActionTypes}}
 */
export function unsetScrollTopic() {
  return {
    type: discussionActionTypes.UNSET_SCROLL_TOPIC,
  };
}

/**
 * Creates an action to refresh all topics and posts.
 *
 * The parameters expected are pure JS objects mapping id to the actually object, not Immutable maps. The reducer
 * will convert them.
 *
 * @param topics A JS object mapping of topicId to topic
 * @param posts A JS object mapping of postId to post
 * @returns {{type: discussionActionTypes, topics: Object, posts: Object}}
 */
function refreshAll(topics, posts) {
  return {
    type: discussionActionTypes.REFRESH_ALL,
    topics,
    posts,
  };
}

/**
 * Creates a thunk to refresh a topic, replacing all it's properties as well as the posts under it.
 *
 * This thunk will NOT remove posts that have been orphaned, indicies will be updated according to what was
 * returned from the server, regardless of whether the actual entity exists or not. Checks for invalid indicies
 * should be done elsewhere.
 * @param topicId The id of the topic to refresh
 * @returns {function(*=)} The thunk to refresh a topic
 */
function refreshTopic(topicId) {
  return (dispatch) => {
    CourseAPI.video.topics
      .show(topicId)
      .then(({ data }) => {
        const { topic, posts } = data;
        if (topic !== undefined && topic.topLevelPostIds.length !== 0) {
          dispatch(updateTopic(topicId, topic));
          if (posts !== undefined) {
            Object.entries(posts).forEach(([postId, post]) => dispatch(updatePost(postId, post)));
          }
        } else {
          dispatch(removeTopic(topicId));
        }
      })
      .catch(() => {
        dispatch(setNotification('Failed to refresh comments, try again later.'));
      });
  };
}

/**
 * Creates a thunk to refresh everything in discussions.
 *
 * This thunk will query the server for all topics and posts and replaces them in the state.
 *
 * @returns {function(*)} The thunk to refresh discussions
 */
export function refreshDiscussion() {
  return (dispatch) => {
    CourseAPI.video.topics
      .index()
      .then(({ data }) => {
        const { topics, posts } = data;
        dispatch(refreshAll(topics || {}, posts || {}));
        dispatch(setNotification('Discussion refreshed.'));
      })
      .catch(() => {
        dispatch(setNotification('Error refreshing, please try again later.'));
      });
  };
}

/**
 * Produces a thunk to submit a reply to the server and waits for a reponse.
 *
 * The new reply is then added to the application state with addReply(..).
 *
 * Sets the notification and status for the new post object created accordingly too.
 * @param topicId The topic id for which the reply is for
 * @returns {function(*, *)} The thunk that submits the request
 */
export function submitNewReplyToServer(topicId) {
  return (dispatch, getState) => {
    dispatch(updateReply(topicId, { status: postRequestingStatuses.LOADING }));

    const state = getState();
    const text = state.discussion.pendingReplyPosts.get(topicId).content;
    const discussionTopicId = state.discussion.topics.get(topicId).discussionTopicId;

    if (text === '') {
      dispatch(setNotification('Comment cannot be blank!'));
      return;
    }

    CourseAPI.comments
      .create(discussionTopicId, { discussion_post: { text } })
      .then(() => {
        dispatch(refreshTopic(topicId));
        dispatch(removeReply(topicId));
      })
      .catch(() => {
        dispatch(updateReply(topicId, { status: postRequestingStatuses.ERROR }));
        dispatch(setNotification('Error replying, please try again later.'));
      });
  };
}

/**
 * Produces a thunk to submit the new post to the server and waits for a response.
 *
 * Sets the notification and status of newTopicPost accordingly too.
 * @returns {function(*, *)} The thunk that submits the post
 */
export function submitNewPostToServer() {
  return (dispatch, getState) => {
    dispatch(updateNewPost({ status: postRequestingStatuses.LOADING }));

    const state = getState();
    const text = state.discussion.newTopicPost.content;
    const timestamp = Math.round(state.video.playerProgress);

    if (text === '') {
      dispatch(setNotification('Comment cannot be blank!'));
      return;
    }

    CourseAPI.video.topics
      .create({ timestamp, discussion_post: { text } })
      .then(({ data }) => {
        const { topicId, topic, postId, post } = data;

        dispatch(addPost(postId, post));
        dispatch(addTopic(topicId, topic)); // Topic may be new, we just overwrite anyway

        dispatch(updateNewPost({ content: '', status: postRequestingStatuses.LOADED }));
        dispatch(setNotification('Comment Added'));
      })
      .catch(() => {
        dispatch(updateNewPost({ status: postRequestingStatuses.ERROR }));
        dispatch(setNotification('Error adding new comment, please try again later.'));
      });
  };
}

/**
 * Produces a thunk to update a post on the server.
 *
 * The content to update will be retrieved from the application state via the editedContent property of a post.
 * @param postId The id of the post to update
 * @returns {function(*, *)} The thunk to update a post
 */
export function updatePostOnServer(postId) {
  return (dispatch, getState) => {
    const state = getState();
    const post = state.discussion.posts.get(postId);
    const text = post.editedContent;
    const discussionTopicId = post.discussionTopicId;

    if (text === null) {
      dispatch(updatePost(postId, { editMode: false }));
      return;
    } else if (text === '') {
      dispatch(setNotification('Comment cannot be blank!'));
      return;
    }

    dispatch(updatePost(postId, { status: postRequestingStatuses.LOADING }));
    CourseAPI.comments
      .update(discussionTopicId, postId, { discussion_post: { text } })
      .then(({ data }) => {
        dispatch(updatePost(postId, {
          editedContent: null,
          editMode: false,
          status: postRequestingStatuses.LOADED,
          content: data.formattedText,
          rawContent: data.text,
        }));
        dispatch(setNotification('Comment edited'));
      })
      .catch(() => {
        dispatch(updatePost(postId, { status: postRequestingStatuses.ERROR }));
        dispatch(setNotification('Failed to edit comment, please try again later.'));
      });
  };
}

/**
 * Produces a thunk to delete a post from the server.
 *
 * This thunk might remove posts, as well as topics (if they become empty) from the application state.
 *
 * Removals are done via removeTopic(..) and removePost(..) and their limitations apply.
 * @param postId The id of the post to remove
 * @returns {function(*, *)} The thunk to delete posts from the server
 */
export function deletePostFromServer(postId) {
  return (dispatch, getState) => {
    const state = getState();
    const post = state.discussion.posts.get(postId);
    const discussionTopicId = post.discussionTopicId;
    const topicId = post.topicId;

    dispatch(updatePost(postId, { status: postRequestingStatuses.LOADING }));
    CourseAPI.comments
      .delete(discussionTopicId, postId)
      .then(() => {
        dispatch(refreshTopic(topicId));
        dispatch(removePost(postId));
        dispatch(setNotification('Comment has been deleted.'));
      })
      .catch(() => {
        dispatch(updatePost(postId, { status: postRequestingStatuses.ERROR }));
        dispatch(setNotification('Failed to delete comment, please try again later.'));
      });
  };
}
