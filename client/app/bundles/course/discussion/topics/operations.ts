import CourseAPI from 'api/course';
import { AxiosResponse } from 'axios';
import {
  CommentPermissions,
  CommentPostListData,
  CommentPostMiniEntity,
  CommentSettings,
  CommentTabTypes,
  CommentTabInfo,
  CommentTopicData,
} from 'types/course/comments';
import { Operation } from 'types/store';
import * as actions from './actions';

const formatPostAttributes = (formattedText: string): Object => {
  return {
    discussion_post: {
      text: formattedText,
    },
  };
};

const formatNewPostAttributes = (text: string): Object => {
  return { discussion_post: { text } };
};

export function fetchTabData(): Operation<
  AxiosResponse<{
    permissions: CommentPermissions;
    settings: CommentSettings;
    tabs: CommentTabInfo;
  }>
> {
  return async (dispatch) =>
    CourseAPI.comments
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveCommentTab(data.permissions, data.settings, data.tabs),
        );
        return response;
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchCommentData(
  tabValue: string,
  pageNum: number,
): Operation<
  AxiosResponse<{
    topicCount: number;
    topicList: CommentTopicData[];
  }>
> {
  // unread is "pending" for students
  const queryTabValue =
    tabValue === CommentTabTypes.UNREAD ? CommentTabTypes.PENDING : tabValue;

  return async (dispatch) =>
    CourseAPI.comments
      .fetchCommentData(queryTabValue, pageNum)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveCommentList(data.topicCount, data.topicList, tabValue),
        );
        return response;
      })
      .catch((error) => {
        throw error;
      });
}

export function updatePending(topicId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.comments
      .togglePending(topicId)
      .then(() => {
        dispatch(actions.savePending(topicId));
      })
      .catch((error) => {
        throw error;
      });
}

export function updateRead(topicId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.comments
      .markAsRead(topicId)
      .then(() => {
        dispatch(actions.saveRead(topicId));
      })
      .catch((error) => {
        throw error;
      });
}

export function createPost(
  topicId: number,
  text: string,
): Operation<AxiosResponse<CommentPostListData>> {
  return async (dispatch) =>
    CourseAPI.comments
      .create(topicId.toString(), formatNewPostAttributes(text))
      .then((response) => {
        dispatch(actions.createPost(response.data));
        return response;
      })
      .catch((error) => {
        throw error;
      });
}

export function updatePost(
  post: CommentPostMiniEntity,
  text: string,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.comments
      .update(
        post.topicId.toString(),
        post.id.toString(),
        formatPostAttributes(text),
      )
      .then(() => {
        dispatch(actions.updatePost(post.id, text));
      })
      .catch((error) => {
        throw error;
      });
}

export function deletePost(post: CommentPostMiniEntity): Operation<void> {
  return async (dispatch) =>
    CourseAPI.comments
      .delete(post.topicId.toString(), post.id.toString())
      .then(() => {
        dispatch(actions.deletePost(post.id));
      })
      .catch((error) => {
        throw error;
      });
}
