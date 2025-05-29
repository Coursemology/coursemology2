import { AxiosResponse } from 'axios';
import { Operation } from 'store';
import {
  CommentPermissions,
  CommentPostListData,
  CommentPostMiniEntity,
  CommentSettings,
  CommentTabInfo,
  CommentTabTypes,
  CommentTopicData,
} from 'types/course/comments';

import CourseAPI from 'api/course';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import { actions } from './store';

const formatPostAttributes = (text: string): Object => {
  return {
    discussion_post: {
      text,
    },
  };
};

const formatPostCodaveriAttributes = (
  text: string,
  codaveriId: number,
  rating: number,
): Object => {
  return {
    discussion_post: {
      text,
      workflow_state: POST_WORKFLOW_STATE.published,
      codaveri_feedback_attributes: {
        id: codaveriId,
        rating,
        status: 'accepted',
      },
    },
  };
};

const formatNewPostAttributes = (text: string): Object => {
  return { discussion_post: { text } };
};

const formatPublishPostAttributes = (text: string): Object => {
  return {
    discussion_post: {
      text,
      workflow_state: POST_WORKFLOW_STATE.published,
    },
  };
};

export function fetchTabData(): Operation<
  AxiosResponse<{
    permissions: CommentPermissions;
    settings: CommentSettings;
    tabs: CommentTabInfo;
  }>
> {
  return async (dispatch) =>
    CourseAPI.comments.index().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveCommentTab(data.permissions, data.settings, data.tabs),
      );
      return response;
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
        dispatch(actions.saveCommentList(data.topicCount, data.topicList));
        return response;
      });
}

export function updatePending(topicId: number): Operation {
  return async (dispatch) =>
    CourseAPI.comments.togglePending(topicId).then(() => {
      dispatch(actions.savePending(topicId));
    });
}

export function updateRead(topicId: number): Operation {
  return async (dispatch) =>
    CourseAPI.comments.markAsRead(topicId).then(() => {
      dispatch(actions.saveRead(topicId));
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
      });
}

export function updatePost(
  post: CommentPostMiniEntity,
  text: string,
): Operation {
  return async (dispatch) =>
    CourseAPI.comments
      .update(
        post.topicId.toString(),
        post.id.toString(),
        formatPostAttributes(text),
      )
      .then((response) => {
        dispatch(actions.updatePost(response.data));
      });
}

export function updatePostCodaveri(
  post: CommentPostMiniEntity,
  text: string,
  rating: number,
): Operation {
  return async (dispatch) =>
    CourseAPI.comments
      .update(
        post.topicId.toString(),
        post.id.toString(),
        formatPostCodaveriAttributes(text, post.codaveriFeedback!.id, rating),
      )
      .then((response) => {
        dispatch(actions.updatePost(response.data));
      });
}

export function deletePost(
  post: CommentPostMiniEntity,
  codaveriRating?: number,
): Operation {
  return async (dispatch) =>
    CourseAPI.comments
      .delete(post.topicId.toString(), post.id.toString(), {
        codaveri_rating: codaveriRating,
      })
      .then(() => {
        dispatch(actions.deletePost(post.id));
      });
}

export function publishPost(
  post: CommentPostMiniEntity,
  text: string,
): Operation {
  return async (dispatch) =>
    CourseAPI.comments
      .update(
        post.topicId.toString(),
        post.id.toString(),
        formatPublishPostAttributes(text),
      )
      .then((response) => {
        dispatch(actions.updatePost(response.data));
      });
}
