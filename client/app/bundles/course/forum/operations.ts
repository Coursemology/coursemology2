import { AxiosResponse } from 'axios';
import { ForumFormData, ForumTopicFormData } from 'types/course/forums';
import { Operation } from 'types/store';

import CourseAPI from 'api/course';

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
} from './reducers';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 */
const formatForumAttributes = (data: ForumFormData): FormData => {
  const payload = new FormData();

  ['name', 'description', 'forumTopicsAutoSubscribe'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'forumTopicsAutoSubscribe':
          payload.append(
            'forum[forum_topics_auto_subscribe]',
            data[field].toString(),
          );
          break;
        default:
          payload.append(`forum[${field}]`, data[field]);
          break;
      }
    }
  });
  return payload;
};

const formatForumTopicAttributes = (data: ForumTopicFormData): FormData => {
  const payload = new FormData();

  ['title', 'text', 'topicType'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'text':
          payload.append('topic[posts_attributes][0][text]', data[field]!);
          break;
        case 'topicType':
          payload.append('topic[topic_type]', data[field]);
          break;
        default:
          payload.append(`topic[${field}]`, data[field]);
          break;
      }
    }
  });
  return payload;
};

// Forum

export function fetchForums(): Operation<void> {
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

export function createForum(formData: ForumFormData): Operation<void> {
  const attributes = formatForumAttributes(formData);
  return async (dispatch) =>
    CourseAPI.forum.forums.create(attributes).then((response) => {
      dispatch(saveForumListData(response.data));
    });
}

export function updateForum(
  formData: ForumFormData,
  forumId: number,
): Operation<{ forumUrl: string }> {
  const attributes = formatForumAttributes(formData);
  return async (dispatch) =>
    CourseAPI.forum.forums.update(forumId, attributes).then((response) => {
      dispatch(updateForumListData(response.data));
      return { forumUrl: response.data.forumUrl };
    });
}

export function deleteForum(forumId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.forums.delete(forumId).then(() => {
      dispatch(removeForum({ forumId }));
    });
}

export function updateForumSubscription(
  forumId: number,
  entityUrl: string,
  isCurrentlySubscribed: boolean,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.forums
      .updateSubscription(entityUrl, isCurrentlySubscribed)
      .then(() => {
        dispatch(changeForumSubscription({ forumId }));
      });
}

export function markAllAsRead(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.forums.markAllAsRead().then(() => {
      dispatch(markAllPostsAsRead());
    });
}

export function markAsRead(forumId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.forums.markAsRead(forumId).then(() => {
      dispatch(markForumPostsAsRead({ forumId }));
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
  formData: ForumTopicFormData,
): Operation<
  AxiosResponse<{
    redirectUrl: string;
  }>
> {
  const attributes = formatForumTopicAttributes(formData);
  return async (_) => CourseAPI.forum.topics.create(forumId, attributes);
}

export function updateForumTopic(
  topicUrl: string,
  formData: ForumTopicFormData,
): Operation<{ topicUrl: string }> {
  const attributes = formatForumTopicAttributes(formData);
  return async (dispatch) =>
    CourseAPI.forum.topics.update(topicUrl, attributes).then((response) => {
      dispatch(updateForumTopicListData(response.data));
      return { topicUrl: response.data.topicUrl };
    });
}

export function deleteForumTopic(
  topicUrl: string,
  topicId: number,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.topics.delete(topicUrl).then(() => {
      dispatch(removeForumTopic({ topicId }));
    });
}

export function updateForumTopicSubscription(
  topicId: number,
  topicUrl: string,
  isCurrentlySubscribed: boolean,
): Operation<void> {
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
): Operation<void> {
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
): Operation<void> {
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
  postText: string,
  parentId?: number,
): Operation<{ postId: number }> {
  return async (dispatch) =>
    CourseAPI.forum.posts
      .create(forumId, topicId, postText, parentId)
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
}

export function updateForumTopicPost(
  postUrl: string,
  postText: string,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.posts.update(postUrl, postText).then((response) => {
      dispatch(updateForumTopicPostListData(response.data));
    });
}

export function deleteForumTopicPost(
  postUrl: string,
  postId: number,
): Operation<{ isTopicDeleted: boolean }> {
  return async (dispatch) =>
    CourseAPI.forum.posts.delete(postUrl).then((response) => {
      dispatch(removeForumTopicPost({ postId }));
      if (response.data?.isTopicDeleted) return { isTopicDeleted: true };
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
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.posts.toggleAnswer(postUrl).then(() => {
      dispatch(updatePostAsAnswer({ topicId, postId }));
    });
}

export function voteTopicPost(
  postUrl: string,
  vote: -1 | 0 | 1,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.forum.posts.vote(postUrl, vote).then((response) => {
      dispatch(updateForumTopicPostListData(response.data));
    });
}
