import { produce } from 'immer';
import {
  DisbursementCourseGroupListData,
  DisbursementCourseUserListData,
  ForumDisbursementFilters,
  ForumDisbursementPostData,
  ForumDisbursementUserData,
} from 'types/course/disbursement';
import {
  createEntityStore,
  removeAllFromStore,
  saveListToStore,
} from 'utilities/store';

import {
  DisbursementActionType,
  DisbursementState,
  REMOVE_FORUM_DISBURSEMENT_LIST,
  RemoveForumDisbursementListAction,
  SAVE_DISBURSEMENT_LIST,
  SAVE_FORUM_DISBURSEMENT_LIST,
  SAVE_FORUM_POST_LIST,
  SaveDisbursementListAction,
  SaveForumDisbursementListAction,
  SaveForumPostListAction,
} from 'bundles/course/experience-points/disbursement/types';

const initialState: DisbursementState = {
  courseGroups: createEntityStore(),
  courseUsers: createEntityStore(),
  filters: {} as ForumDisbursementFilters,
  forumUsers: createEntityStore(),
  forumPosts: createEntityStore(),
};

const reducer = produce(
  (draft: DisbursementState, action: DisbursementActionType) => {
    switch (action.type) {
      case SAVE_DISBURSEMENT_LIST: {
        const courseGroups = action.courseGroups.map((data) => ({
          ...data,
        }));
        const courseUsers = action.courseUsers.map((data) => ({
          ...data,
        }));

        saveListToStore(draft.courseGroups, courseGroups);
        saveListToStore(draft.courseUsers, courseUsers);
        break;
      }
      case SAVE_FORUM_DISBURSEMENT_LIST: {
        const filters = { ...action.filters };
        const forumUsersData = action.forumUsers;
        const forumUserEntity = forumUsersData.map((data) => ({
          ...data,
        }));

        removeAllFromStore(draft.forumUsers);
        removeAllFromStore(draft.forumPosts);
        saveListToStore(draft.forumUsers, forumUserEntity);
        draft.filters = filters;
        break;
      }
      case REMOVE_FORUM_DISBURSEMENT_LIST: {
        removeAllFromStore(draft.forumUsers);
        removeAllFromStore(draft.forumPosts);
        break;
      }
      case SAVE_FORUM_POST_LIST: {
        const forumPostEntity = action.posts.map((data) => ({
          ...data,
          userId: action.userId,
        }));
        saveListToStore(draft.forumPosts, forumPostEntity);
        break;
      }
      default: {
        break;
      }
    }
  },
  initialState,
);

export const actions = {
  saveDisbursementList: (
    courseGroups: DisbursementCourseGroupListData[],
    courseUsers: DisbursementCourseUserListData[],
  ): SaveDisbursementListAction => ({
    type: SAVE_DISBURSEMENT_LIST,
    courseGroups,
    courseUsers,
  }),

  saveForumDisbursementList: (
    filters: ForumDisbursementFilters,
    forumUsers: ForumDisbursementUserData[],
  ): SaveForumDisbursementListAction => ({
    type: SAVE_FORUM_DISBURSEMENT_LIST,
    filters,
    forumUsers,
  }),

  removeForumDisbursementList: (): RemoveForumDisbursementListAction => ({
    type: REMOVE_FORUM_DISBURSEMENT_LIST,
  }),

  saveForumPostList: (
    posts: ForumDisbursementPostData[],
    userId: number,
  ): SaveForumPostListAction => ({
    type: SAVE_FORUM_POST_LIST,
    posts,
    userId,
  }),
};

export default reducer;
