import { Operation } from 'store';
import {
  ForumFormData,
  ForumTopicFormData,
  ForumTopicPostFormData,
} from 'types/course/forums';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import pollJob from 'lib/helpers/jobHelpers';

import {
  changeForumTopicHidden,
  changeForumTopicLocked,
  changeForumTopicSubscription,
  markAllPostsAsRead,
  markForumPostsAsRead,
  removeForum,
  removeForumTopic,
  removeForumTopicPost,
  saveAllForumListData,
  saveForumData,
  saveForumListData,
  saveForumTopicData,
  saveForumTopicPostListData,
  updateForumListData,
  updateForumSubscription as changeForumSubscription,
  updateForumTopicListData,
  updateForumTopicPostIds,
  updateForumTopicPostListData,
  updatePostAsAnswer,
  updatePostWorkflowState,
} from './store';

const GENERATE_REPLY_JOB_POLL_INTERVAL_MS = 2000;

// Forum

export function fetchForums(): Operation {
  return async (dispatch) =>
    CourseAPI.forum.forums
      .index()
      .then((response) => {
        dispatch(saveAllForumListData(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchForum(forumId: string): Operation<number> {
  return async (dispatch) =>
    CourseAPI.forum.forums
      .fetch(forumId)
      .then((response) => {
        dispatch(saveForumData(response.data));
        return response.data.forum.id;
      })
      .catch((error) => {
        throw error;
      });
}

export function createForum(forumFormData: ForumFormData): Operation {
  const forumPostData = {
    forum: {
      name: forumFormData.name,
      description: forumFormData.description,
      forum_topics_auto_subscribe: forumFormData.forumTopicsAutoSubscribe,
    },
  };
  return async (dispatch) =>
    CourseAPI.forum.forums.create(forumPostData).then((response) => {
      dispatch(saveForumListData(response.data));
    });
}

export function updateForum(
  forumFormData: ForumFormData,
  forumId: number,
): Operation<{ forumUrl: string }> {
  const ForumPatchData = {
    forum: {
      id: forumFormData.id,
      name: forumFormData.name,
      description: forumFormData.description,
      forum_topics_auto_subscribe: forumFormData.forumTopicsAutoSubscribe,
    },
  };
  return async (dispatch) =>
    CourseAPI.forum.forums.update(forumId, ForumPatchData).then((response) => {
      dispatch(updateForumListData(response.data));
      return { forumUrl: response.data.forumUrl };
    });
}

export function deleteForum(forumId: number): Operation {
  return async (dispatch) =>
    CourseAPI.forum.forums.delete(forumId).then(() => {
      dispatch(removeForum({ forumId }));
    });
}

export function updateForumSubscription(
  forumId: number,
  entityUrl: string,
  isCurrentlySubscribed: boolean,
): Operation {
  return async (dispatch) =>
    CourseAPI.forum.forums
      .updateSubscription(entityUrl, isCurrentlySubscribed)
      .then(() => {
        dispatch(changeForumSubscription({ forumId }));
      });
}

export function markAllAsRead(): Operation {
  return async (dispatch) =>
    CourseAPI.forum.forums.markAllAsRead().then(() => {
      dispatch(markAllPostsAsRead());
    });
}

export function markAsRead(forumId: number): Operation {
  return async (dispatch) =>
    CourseAPI.forum.forums.markAsRead(forumId).then((response) => {
      dispatch(
        markForumPostsAsRead({
          forumId,
          nextUnreadTopicUrl: response.data.nextUnreadTopicUrl,
        }),
      );
    });
}

// Topic

export function fetchForumTopic(
  forumId: string,
  topicId: string,
): Operation<number> {
  return async (dispatch) =>
    CourseAPI.forum.topics
      .fetch(forumId, topicId)
      .then((response) => {
        dispatch(saveForumTopicData(response.data));
        return response.data.topic.id;
      })
      .catch((error) => {
        throw error;
      });
}

export function createForumTopic(
  forumId: string,
  topicFormData: ForumTopicFormData,
): Operation<JustRedirect> {
  const ForumTopicPostData = {
    topic: {
      title: topicFormData.title,
      topic_type: topicFormData.topicType,
      is_anonymous: topicFormData.isAnonymous,
      posts_attributes: [
        { text: topicFormData.text, is_anonymous: topicFormData.isAnonymous },
      ],
    },
  };
  return async () =>
    CourseAPI.forum.topics
      .create(forumId, ForumTopicPostData)
      .then((response) => response.data);
}

export function updateForumTopic(
  topicUrl: string,
  topicFormData: ForumTopicFormData,
): Operation<{ topicUrl: string }> {
  const ForumTopicPatchData = {
    topic: {
      id: topicFormData.id,
      title: topicFormData.title,
      topic_type: topicFormData.topicType,
      posts_attributes: [{ text: topicFormData.text }],
    },
  };
  return async (dispatch) =>
    CourseAPI.forum.topics
      .update(topicUrl, ForumTopicPatchData)
      .then((response) => {
        dispatch(updateForumTopicListData(response.data));
        return { topicUrl: response.data.topicUrl };
      });
}

export function deleteForumTopic(topicUrl: string, topicId: number): Operation {
  return async (dispatch) =>
    CourseAPI.forum.topics.delete(topicUrl).then(() => {
      dispatch(removeForumTopic({ topicId }));
    });
}

export function updateForumTopicSubscription(
  topicId: number,
  topicUrl: string,
  isCurrentlySubscribed: boolean,
): Operation {
  return async (dispatch) =>
    CourseAPI.forum.topics
      .updateSubscription(topicUrl, isCurrentlySubscribed)
      .then(() => {
        dispatch(changeForumTopicSubscription({ topicId }));
      });
}

export function updateForumTopicHidden(
  topicId: number,
  topicUrl: string,
  isCurrentlyHidden: boolean,
): Operation {
  return async (dispatch) =>
    CourseAPI.forum.topics
      .updateHidden(topicUrl, isCurrentlyHidden)
      .then(() => {
        dispatch(changeForumTopicHidden({ topicId }));
      });
}

export function updateForumTopicLocked(
  topicId: number,
  topicUrl: string,
  isCurrentlyLocked: boolean,
): Operation {
  return async (dispatch) =>
    CourseAPI.forum.topics
      .updateLocked(topicUrl, isCurrentlyLocked)
      .then(() => {
        dispatch(changeForumTopicLocked({ topicId }));
      });
}

// Post

export function createForumTopicPost(
  forumId: string,
  topicId: string,
  postFormData: ForumTopicPostFormData,
): Operation<{ postId: number }> {
  return async (dispatch) => {
    const ForumTopicPostPostData = {
      discussion_post: {
        text: postFormData.text,
        is_anonymous: postFormData.isAnonymous,
        parent_id: postFormData.parentId,
      },
    };
    return CourseAPI.forum.posts
      .create(forumId, topicId, ForumTopicPostPostData)
      .then((response) => {
        dispatch(saveForumTopicPostListData(response.data.post));
        dispatch(
          updateForumTopicPostIds({
            topicId: response.data.post.topicId,
            postTreeIds: response.data.postTreeIds,
          }),
        );
        return { postId: response.data.post.id };
      });
  };
}

export function updateForumTopicPost(
  postUrl: string,
  postText: string,
): Operation {
  return async (dispatch) =>
    CourseAPI.forum.posts.update(postUrl, postText).then((response) => {
      dispatch(updateForumTopicPostListData(response.data));
    });
}

export function deleteForumTopicPost(
  postUrl: string,
  postId: number,
  topicId: number,
): Operation<{ isTopicDeleted: boolean }> {
  return async (dispatch) =>
    CourseAPI.forum.posts.delete(postUrl).then((response) => {
      dispatch(removeForumTopicPost({ postId }));
      if (response.data?.isTopicDeleted) return { isTopicDeleted: true };
      if (response.data.isTopicResolved === false) {
        dispatch(
          updatePostAsAnswer({
            topicId,
            postId,
            isTopicResolved: response.data.isTopicResolved,
          }),
        );
      }

      dispatch(
        updateForumTopicPostIds({
          topicId: response.data.topicId,
          postTreeIds: response.data.postTreeIds,
        }),
      );
      return { isTopicDeleted: false };
    });
}

export function toggleForumTopicPostAnswer(
  postUrl: string,
  topicId: number,
  postId: number,
): Operation {
  return async (dispatch) =>
    CourseAPI.forum.posts.toggleAnswer(postUrl).then((response) => {
      dispatch(
        updatePostAsAnswer({
          topicId,
          postId,
          isTopicResolved: response.data.isTopicResolved,
        }),
      );
    });
}

export function markForumTopicPostAnswerAndPublish(
  postUrl: string,
  topicId: number,
  postId: number,
): Operation {
  return async (dispatch) =>
    CourseAPI.forum.posts.markAnswerAndPublish(postUrl).then((response) => {
      dispatch(
        updatePostAsAnswer({
          topicId,
          postId,
          isTopicResolved: response.data.isTopicResolved,
          workflowState: response.data.workflowState,
          creator: response.data.creator,
        }),
      );
    });
}

export function voteTopicPost(postUrl: string, vote: -1 | 0 | 1): Operation {
  return async (dispatch) =>
    CourseAPI.forum.posts.vote(postUrl, vote).then((response) => {
      dispatch(updateForumTopicPostListData(response.data));
    });
}

export function publishPost(postId: number, postUrl: string): Operation {
  return async (dispatch) =>
    CourseAPI.forum.posts.publish(postUrl).then((response) => {
      dispatch(
        updatePostWorkflowState({
          postId,
          workflowState: response.data.workflowState,
          creator: response.data.creator,
        }),
      );
    });
}

export function generateNewReply(
  forumId: string,
  topicId: string,
  postId: number,
  postUrl: string,
  handleSuccess: () => void,
  handleFailure: () => void,
): Operation {
  return async (dispatch) => {
    CourseAPI.forum.posts
      .generateReply(postUrl)
      .then((job) => {
        dispatch(
          updatePostWorkflowState({
            postId,
            workflowState: POST_WORKFLOW_STATE.answering,
          }),
        );
        const jobUrl = job.data.jobUrl;
        pollJob(
          jobUrl,
          () => {
            dispatch(
              updatePostWorkflowState({
                postId,
                workflowState: POST_WORKFLOW_STATE.published,
              }),
            );
            dispatch(fetchForumTopic(forumId, topicId));
            handleSuccess();
          },
          () => {
            dispatch(
              updatePostWorkflowState({
                postId,
                workflowState: POST_WORKFLOW_STATE.published,
              }),
            );
            handleFailure();
          },
          GENERATE_REPLY_JOB_POLL_INTERVAL_MS,
        );
      })
      .catch(handleFailure);
  };
}
