import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RecursiveArray } from 'types';
import {
  ForumData,
  ForumEntity,
  ForumListData,
  ForumMetadata,
  ForumPermissions,
  ForumTopicData,
  ForumTopicEntity,
  ForumTopicListData,
  ForumTopicPostEntity,
  ForumTopicPostListData,
} from 'types/course/forums';

import { ForumsState } from './types';

export const forumAdapter = createEntityAdapter<ForumEntity>({});
export const forumTopicAdapter = createEntityAdapter<ForumTopicEntity>({});
export const forumTopicPostAdapter = createEntityAdapter<ForumTopicPostEntity>(
  {},
);

const initialState: ForumsState = {
  forumTitle: '',
  forums: forumAdapter.getInitialState(),
  topics: forumTopicAdapter.getInitialState(),
  posts: forumTopicPostAdapter.getInitialState(),
  metadata: {
    nextUnreadTopicUrl: null,
  },
  permissions: { canCreateForum: false },
};

export const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    // Forum
    saveAllForumListData: (
      state,
      action: PayloadAction<{
        forumTitle: string;
        forums: ForumListData[];
        metadata: ForumMetadata;
        permissions: ForumPermissions;
      }>,
    ) => {
      const forumEntities = action.payload.forums.map((forum) => ({
        ...forum,
        topicIds: null,
        nextUnreadTopicUrl: null,
      }));
      forumAdapter.removeAll(state.forums);
      forumAdapter.setAll(state.forums, forumEntities);
      state.forumTitle = action.payload.forumTitle;
      state.metadata = action.payload.metadata;
      state.permissions = action.payload.permissions;
    },
    saveForumListData: (state, action: PayloadAction<ForumListData>) => {
      forumAdapter.addOne(state.forums, {
        ...action.payload,
        topicIds: null,
        nextUnreadTopicUrl: null,
      });
    },
    updateForumListData: (state, action: PayloadAction<ForumListData>) => {
      const updatedData = { id: action.payload.id, changes: action.payload };
      forumAdapter.updateOne(state.forums, updatedData);
    },
    updateForumSubscription: (
      state,
      action: PayloadAction<{ forumId: number }>,
    ) => {
      const forum = state.forums.entities[action.payload.forumId];
      if (forum) {
        forum.emailSubscription.isUserSubscribed =
          !forum.emailSubscription.isUserSubscribed;
        forumAdapter.upsertOne(state.forums, forum);
      }
    },
    saveForumData: (
      state,
      action: PayloadAction<{ forum: ForumData; topics: ForumTopicListData[] }>,
    ) => {
      forumAdapter.upsertOne(state.forums, action.payload.forum);
      // @ts-ignore: ignore ts warning for infinite recursion
      forumTopicAdapter.setAll(state.topics, action.payload.topics);
    },
    removeForum: (state, action: PayloadAction<{ forumId: number }>) => {
      forumAdapter.removeOne(state.forums, action.payload.forumId);
    },
    markAllPostsAsRead: (state) => {
      const updatedData = state.forums.ids.map((id) => {
        return { id, changes: { topicUnreadCount: 0 } };
      });
      forumAdapter.updateMany(state.forums, updatedData);
      state.metadata.nextUnreadTopicUrl = null;
    },

    // Forum Topic
    updateForumTopicListData: (
      state,
      action: PayloadAction<ForumTopicListData>,
    ) => {
      const updatedData = { id: action.payload.id, changes: action.payload };
      // @ts-ignore: ignore ts warning for infinite recursion
      forumTopicAdapter.updateOne(state.topics, updatedData);
    },
    saveForumTopicData: (
      state,
      action: PayloadAction<{
        topic: ForumTopicData;
        postTreeIds: RecursiveArray<number>;
        nextUnreadTopicUrl: string | null;
        posts: ForumTopicPostListData[];
      }>,
    ) => {
      forumTopicAdapter.upsertOne(state.topics, {
        ...action.payload.topic,
        nextUnreadTopicUrl: action.payload.nextUnreadTopicUrl,
        postTreeIds: action.payload.postTreeIds,
      });
      forumTopicPostAdapter.setAll(state.posts, action.payload.posts);
    },
    removeForumTopic: (state, action: PayloadAction<{ topicId: number }>) => {
      forumTopicAdapter.removeOne(state.topics, action.payload.topicId);
    },
    markForumPostsAsRead: (
      state,
      action: PayloadAction<{
        forumId: number;
        nextUnreadTopicUrl: string | null;
      }>,
    ) => {
      const topicIds = state.forums.entities[action.payload.forumId]?.topicIds;
      if (topicIds) {
        const updatedTopicEntities = topicIds.map((topicId) => {
          return {
            id: topicId,
            changes: {
              isUnread: false,
            },
          };
        });
        // When topics in a forum are all marked as read, the next unread topic url
        // needs to be updated to reflect the url of unread topic in another forum
        forumAdapter.updateOne(state.forums, {
          id: action.payload.forumId,
          changes: { nextUnreadTopicUrl: action.payload.nextUnreadTopicUrl },
        });
        forumTopicAdapter.updateMany(state.topics, updatedTopicEntities);
      }
    },
    changeForumTopicSubscription: (
      state,
      action: PayloadAction<{ topicId: number }>,
    ) => {
      const topic = state.topics.entities[action.payload.topicId];
      if (topic) {
        topic.emailSubscription.isUserSubscribed =
          !topic.emailSubscription.isUserSubscribed;
        forumTopicAdapter.upsertOne(state.topics, topic);
      }
    },
    changeForumTopicHidden: (
      state,
      action: PayloadAction<{ topicId: number }>,
    ) => {
      const topic = state.topics.entities[action.payload.topicId];
      if (topic) {
        topic.isHidden = !topic.isHidden;
        forumTopicAdapter.upsertOne(state.topics, topic);
      }
    },
    changeForumTopicLocked: (
      state,
      action: PayloadAction<{ topicId: number }>,
    ) => {
      const topic = state.topics.entities[action.payload.topicId];
      if (topic) {
        topic.isLocked = !topic.isLocked;
        forumTopicAdapter.upsertOne(state.topics, topic);
      }
    },

    // Forum Topic Post
    updateForumTopicPostIds: (
      state,
      action: PayloadAction<{
        topicId: number;
        postTreeIds: ForumTopicEntity['postTreeIds'];
      }>,
    ) => {
      const topic = state.topics.entities[action.payload.topicId];
      if (topic) {
        topic.postTreeIds = action.payload.postTreeIds;
        forumTopicAdapter.upsertOne(state.topics, topic);
      }
    },
    saveForumTopicPostListData: (
      state,
      action: PayloadAction<ForumTopicPostListData>,
    ) => {
      forumTopicPostAdapter.addOne(state.posts, action.payload);
    },
    updateForumTopicPostListData: (
      state,
      action: PayloadAction<ForumTopicPostListData>,
    ) => {
      const updatedData = { id: action.payload.id, changes: action.payload };
      forumTopicPostAdapter.updateOne(state.posts, updatedData);
    },
    removeForumTopicPost: (
      state,
      action: PayloadAction<{ postId: number }>,
    ) => {
      forumTopicPostAdapter.removeOne(state.posts, action.payload.postId);
    },
    updatePostAsAnswer: (
      state,
      action: PayloadAction<{
        topicId: number;
        postId: number;
        isTopicResolved: boolean;
      }>,
    ) => {
      const topic = state.topics.entities[action.payload.topicId];
      const post = state.posts.entities[action.payload.postId];
      if (topic) {
        topic.isResolved = action.payload.isTopicResolved;
        forumTopicAdapter.upsertOne(state.topics, topic);
      }
      if (post) {
        post.isAnswer = !post.isAnswer;
        forumTopicPostAdapter.upsertOne(state.posts, post);
      }
    },
  },
});

export const {
  saveAllForumListData,
  saveForumListData,
  updateForumListData,
  updateForumSubscription,
  saveForumData,
  removeForum,
  markAllPostsAsRead,

  updateForumTopicListData,
  saveForumTopicData,
  removeForumTopic,
  markForumPostsAsRead,
  changeForumTopicSubscription,
  changeForumTopicHidden,
  changeForumTopicLocked,

  updateForumTopicPostIds,
  saveForumTopicPostListData,
  updateForumTopicPostListData,
  removeForumTopicPost,
  updatePostAsAnswer,
} = forumSlice.actions;

export default forumSlice.reducer;
